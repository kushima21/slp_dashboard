<?php

namespace App\Http\Controllers;

use App\Models\SLPMonitoringRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'evaluation_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'municipality' => ['nullable', 'string', 'max:255'],
            'track' => ['nullable', 'string', 'max:100'],
            'enterprises_status' => ['nullable', 'string', 'max:100'],
        ]);

        $filters = [
            'evaluation_year' => $validated['evaluation_year'] ?? '',
            'municipality' => $validated['municipality'] ?? '',
            'track' => $validated['track'] ?? '',
            'enterprises_status' => $validated['enterprises_status'] ?? '',
        ];

        /*
         * Dropdown options come from the complete monitoring dataset,
         * so the available options do not disappear when filters change.
         */
        $optionsQuery = SLPMonitoringRecord::query();

        $options = [
            'years' => (clone $optionsQuery)
                ->whereNotNull('evaluation_year')
                ->distinct()
                ->orderByDesc('evaluation_year')
                ->pluck('evaluation_year')
                ->map(fn ($year) => (int) $year)
                ->values(),

            'municipalities' => (clone $optionsQuery)
                ->whereNotNull('municipality')
                ->whereRaw("TRIM(municipality) <> ''")
                ->distinct()
                ->orderBy('municipality')
                ->pluck('municipality')
                ->values(),

            'tracks' => (clone $optionsQuery)
                ->whereNotNull('track')
                ->whereRaw("TRIM(track) <> ''")
                ->distinct()
                ->orderBy('track')
                ->pluck('track')
                ->values(),

            'statuses' => (clone $optionsQuery)
                ->whereNotNull('enterprises_status')
                ->whereRaw("TRIM(enterprises_status) <> ''")
                ->distinct()
                ->orderBy('enterprises_status')
                ->pluck('enterprises_status')
                ->values(),
        ];

        /*
         * Apply all selected filters.
         */
        $query = SLPMonitoringRecord::query()
            ->when(
                $filters['evaluation_year'] !== '',
                fn ($q) => $q->where(
                    'evaluation_year',
                    $filters['evaluation_year']
                )
            )
            ->when(
                $filters['municipality'] !== '',
                fn ($q) => $q->where(
                    'municipality',
                    $filters['municipality']
                )
            )
            ->when(
                $filters['track'] !== '',
                fn ($q) => $q->where(
                    'track',
                    $filters['track']
                )
            )
            ->when(
                $filters['enterprises_status'] !== '',
                fn ($q) => $q->where(
                    'enterprises_status',
                    $filters['enterprises_status']
                )
            );

        $records = $query
            ->orderByDesc('date_provided')
            ->orderByDesc('monitoring_record_id')
            ->get([
                'monitoring_record_id',
                'beneficiaries_id',
                'evaluation_year',
                'date_provided',
                'track',
                'municipality',
                'barangay',
                'name_of_project',
                'type_of_enterprise',
                'name_of_slpa_slp_participant',
                'enterprises_status',
                'evaluation_recommendation',
                'remarks',
            ]);

        /*
         * Normalize enterprise status.
         */
        $classifyStatus = function ($status) {
            $status = strtolower(trim((string) $status));

            if (
                str_contains($status, 'closure') ||
                str_contains($status, 'inactive') ||
                str_contains($status, 'closed')
            ) {
                return 'inactive';
            }

            if (
                str_contains($status, 'rehabilitation') ||
                str_contains($status, 'at risk') ||
                str_contains($status, 'at-risk') ||
                str_contains($status, 'pending')
            ) {
                return 'atRisk';
            }

            if (
                str_contains($status, 'mainstream') ||
                $status === 'active'
            ) {
                return 'active';
            }

            return 'unknown';
        };

        /*
         * Summary cards.
         *
         * These totals represent monitoring records, not unique enterprises.
         */
        $total = $records->count();

        $active = $records->filter(
            fn ($record) =>
                $classifyStatus($record->enterprises_status) === 'active'
        )->count();

        $atRisk = $records->filter(
            fn ($record) =>
                $classifyStatus($record->enterprises_status) === 'atRisk'
        )->count();

        $inactive = $records->filter(
            fn ($record) =>
                $classifyStatus($record->enterprises_status) === 'inactive'
        )->count();

        /*
         * Group monitoring records by municipality.
         */
        $municipalityStats = $records
            ->groupBy(function ($record) {
                $municipality = trim(
                    (string) $record->municipality
                );

                return $municipality !== ''
                    ? $municipality
                    : 'Unspecified Municipality';
            })
            ->map(function ($group, $municipality) use ($classifyStatus) {
                $activeCount = 0;
                $atRiskCount = 0;
                $inactiveCount = 0;

                foreach ($group as $record) {
                    $status = $classifyStatus(
                        $record->enterprises_status
                    );

                    if ($status === 'active') {
                        $activeCount++;
                    } elseif ($status === 'atRisk') {
                        $atRiskCount++;
                    } elseif ($status === 'inactive') {
                        $inactiveCount++;
                    }
                }

                return [
                    'municipality' => $municipality,
                    'total' => $group->count(),
                    'active' => $activeCount,
                    'atRisk' => $atRiskCount,
                    'inactive' => $inactiveCount,
                ];
            })
            ->sortByDesc('total')
            ->values();

        /*
         * Calculate municipality priority scores.
         *
         * Active/mainstreaming: 10 points
         * Pending/rehabilitation: 60 points
         * Closure/inactive: 100 points
         *
         * Unrecognized statuses are excluded from the score denominator.
         */
        $priorityMunicipalities = $municipalityStats
            ->map(function ($item) {
                $classifiedTotal =
                    $item['active'] +
                    $item['atRisk'] +
                    $item['inactive'];

                $score = $classifiedTotal > 0
                    ? (
                        ($item['active'] * 10) +
                        ($item['atRisk'] * 60) +
                        ($item['inactive'] * 100)
                    ) / $classifiedTotal
                    : 0;

                $score = round($score, 1);

                $level = $classifiedTotal === 0
                    ? 'Low'
                    : (
                        $score >= 50
                            ? 'High'
                            : ($score >= 25 ? 'Medium' : 'Low')
                    );

                return [
                    'municipality' => $item['municipality'],
                    'total' => $item['total'],
                    'active' => $item['active'],
                    'atRisk' => $item['atRisk'],
                    'inactive' => $item['inactive'],
                    'score' => $score,
                    'level' => $level,
                ];
            })
            ->sortByDesc('score')
            ->values();

        $highPriorityMunicipalities = $priorityMunicipalities
            ->where('level', 'High')
            ->count();

        /*
         * Enterprise watch-list.
         *
         * Include closure/inactive, pending/rehabilitation, and records
         * with follow-up language in remarks or recommendations.
         */
        $watchList = $records
            ->filter(function ($record) use ($classifyStatus) {
                $status = $classifyStatus(
                    $record->enterprises_status
                );

                $recommendation = strtolower(
                    trim((string) $record->evaluation_recommendation)
                );

                $remarks = strtolower(
                    trim((string) $record->remarks)
                );

                $needsFollowUp = preg_match(
                    '/follow.?up|monitor|intervention|rehabilitat|review|improve|assistance|support|recommend/i',
                    $recommendation . ' ' . $remarks
                );

                return in_array(
                    $status,
                    ['inactive', 'atRisk'],
                    true
                ) || (bool) $needsFollowUp;
            })
            ->take(100)
            ->map(function ($record) {
                return [
                    'id' => $record->monitoring_record_id,
                    'beneficiaries_id' => $record->beneficiaries_id,

                    'name' => $record->name_of_project
                        ?: $record->type_of_enterprise
                        ?: $record->name_of_slpa_slp_participant
                        ?: 'Unnamed enterprise',

                    'municipality' => $record->municipality
                        ?: 'Unspecified Municipality',

                    'barangay' => $record->barangay ?: 'N/A',

                    'status' => $record->enterprises_status
                        ?: 'Unclassified',

                    'track' => $record->track ?: 'N/A',

                    'year' => $record->evaluation_year,

                    'date' => $record->date_provided
                        ? $record->date_provided->format('M d, Y')
                        : null,

                    'recommendation' =>
                        $record->evaluation_recommendation
                        ?: $record->remarks
                        ?: null,
                ];
            })
            ->values();

        return Inertia::render('Admin/Analytics', [
            'summary' => [
                'total' => $total,
                'active' => $active,
                'atRisk' => $atRisk,
                'inactive' => $inactive,

                'activePercentage' => $total > 0
                    ? round(($active / $total) * 100, 1)
                    : 0,

                'atRiskPercentage' => $total > 0
                    ? round(($atRisk / $total) * 100, 1)
                    : 0,

                'inactivePercentage' => $total > 0
                    ? round(($inactive / $total) * 100, 1)
                    : 0,

                'highPriorityMunicipalities' =>
                    $highPriorityMunicipalities,

                'totalMunicipalities' => $municipalityStats->count(),
            ],

            'municipalityStats' => $municipalityStats,
            'priorityMunicipalities' => $priorityMunicipalities,
            'watchList' => $watchList,
            'filters' => $filters,
            'options' => $options,
        ]);
    }
}
