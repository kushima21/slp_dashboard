<?php

namespace App\Http\Controllers;

use App\Models\SLPMonitoringRecord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SummaryController extends Controller
{
    /**
     * Display summary records within the authenticated user's access scope.
     */
    public function index(Request $request)
    {
        $baseQuery = $this->scopedQuery($request);
        $query = $this->filteredQuery($request);

        $records = (clone $query)
            ->orderByDesc('date_provided')
            ->orderByDesc('evaluation_year')
            ->orderByDesc('monitoring_record_id')
            ->paginate(12)
            ->withQueryString();

        $allRecords = (clone $query)->get([
            'monitoring_record_id',
            'total_grant_received',
            'enterprises_status',
        ]);

        $user = $request->user();
        $isLguUser = $this->userHasRole($user, 'lgu');
        $userLgu = trim((string) ($user?->lgu ?? ''));

        // LGU users receive only their own LGU as a filter option.
        $lguOptions = $isLguUser
            ? ($userLgu !== '' ? collect([$userLgu]) : collect())
            : (clone $baseQuery)
                ->whereNotNull('lgu')
                ->whereRaw("TRIM(lgu) != ''")
                ->select('lgu')
                ->distinct()
                ->orderBy('lgu')
                ->pluck('lgu')
                ->values();

        $municipalityOptions = (clone $baseQuery)
            ->when(
                $request->filled('lgu') && !$isLguUser,
                fn ($q) => $q->where('lgu', $request->input('lgu'))
            )
            ->whereNotNull('municipality')
            ->whereRaw("TRIM(municipality) != ''")
            ->select('municipality')
            ->distinct()
            ->orderBy('municipality')
            ->pluck('municipality')
            ->values();

        $barangayOptions = (clone $baseQuery)
            ->when(
                $request->filled('lgu') && !$isLguUser,
                fn ($q) => $q->where('lgu', $request->input('lgu'))
            )
            ->when(
                $request->filled('municipality'),
                fn ($q) => $q->where(
                    'municipality',
                    $request->input('municipality')
                )
            )
            ->whereNotNull('barangay')
            ->whereRaw("TRIM(barangay) != ''")
            ->select('barangay')
            ->distinct()
            ->orderBy('barangay')
            ->pluck('barangay')
            ->values();

        return Inertia::render('Admin/Summary', [
            'summary' => $records,

            'filters' => [
                'search' => $request->input('search', ''),
                'evaluation_year' => $request->input('evaluation_year', ''),
                'track' => $request->input('track', ''),
                // Always return the authenticated LGU for LGU users.
                'lgu' => $isLguUser
                    ? $userLgu
                    : $request->input('lgu', ''),
                'municipality' => $request->input('municipality', ''),
                'barangay' => $request->input('barangay', ''),
                'type_of_enterprise' => $request->input(
                    'type_of_enterprise',
                    ''
                ),
                'enterprises_status' => $request->input(
                    'enterprises_status',
                    ''
                ),
            ],

            'access' => [
                'isLguUser' => $isLguUser,
                'isAdmin' => $this->userHasRole($user, 'admin'),
                'lgu' => $isLguUser ? $userLgu : null,
            ],

            'options' => [
                'years' => (clone $baseQuery)
                    ->whereNotNull('evaluation_year')
                    ->select('evaluation_year')
                    ->distinct()
                    ->orderByDesc('evaluation_year')
                    ->pluck('evaluation_year')
                    ->values(),

                'tracks' => (clone $baseQuery)
                    ->whereNotNull('track')
                    ->whereRaw("TRIM(track) != ''")
                    ->select('track')
                    ->distinct()
                    ->orderBy('track')
                    ->pluck('track')
                    ->values(),

                'lgus' => $lguOptions,
                'municipalities' => $municipalityOptions,
                'barangays' => $barangayOptions,

                'enterpriseTypes' => (clone $baseQuery)
                    ->whereNotNull('type_of_enterprise')
                    ->whereRaw("TRIM(type_of_enterprise) != ''")
                    ->select('type_of_enterprise')
                    ->distinct()
                    ->orderBy('type_of_enterprise')
                    ->pluck('type_of_enterprise')
                    ->values(),
            ],

            'stats' => [
                'total' => $allRecords->count(),

                'mainstreaming' => $allRecords
                    ->filter(
                        fn ($record) =>
                            strcasecmp(
                                trim((string) $record->enterprises_status),
                                'Mainstreaming'
                            ) === 0
                    )
                    ->count(),

                'rehabilitation' => $allRecords
                    ->filter(
                        fn ($record) =>
                            strcasecmp(
                                trim((string) $record->enterprises_status),
                                'Rehabilitation'
                            ) === 0
                    )
                    ->count(),

                'closure' => $allRecords
                    ->filter(
                        fn ($record) =>
                            strcasecmp(
                                trim((string) $record->enterprises_status),
                                'Closure'
                            ) === 0
                    )
                    ->count(),

                'totalGrant' => (float) $allRecords->sum(
                    fn ($record) =>
                        (float) ($record->total_grant_received ?? 0)
                ),
            ],
        ]);
    }

    /**
     * Export all matching, authorized records to Excel.
     */
    public function exportExcel(Request $request)
    {
        $records = $this->filteredQuery($request)
            ->orderByDesc('date_provided')
            ->orderByDesc('evaluation_year')
            ->orderByDesc('monitoring_record_id')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('SLP Summary');

        $headers = [
            'Monitoring ID',
            'Evaluation Year',
            'Date Provided',
            'MPDO Evaluator',
            'Track',
            'Modality',
            'District',
            'LGU',
            'Municipality',
            'Barangay',
            'Total Grant Received',
            'Name of Project',
            'Type of Enterprise',
            'SLP Participant',
            'Enterprise Status',
            'Intervention Support',
            'Evaluation Recommendation',
            'Remarks',
        ];

        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;

        foreach ($records as $record) {
            $sheet->fromArray([
                $record->monitoring_record_id,
                $record->evaluation_year,
                $record->date_provided
                    ? $record->date_provided->format('Y-m-d')
                    : '',
                $record->mpdos,
                $record->track,
                $record->modality,
                $record->district,
                $record->lgu,
                $record->municipality,
                $record->barangay,
                (float) ($record->total_grant_received ?? 0),
                $record->name_of_project,
                $record->type_of_enterprise,
                $record->name_of_slpa_slp_participant,
                $record->enterprises_status,
                $record->intervention_support,
                $record->evaluation_recommendation,
                $record->remarks,
            ], null, 'A' . $rowNumber);

            $rowNumber++;
        }

        $lastColumn = 'R';
        $lastRow = max(1, $rowNumber - 1);

        $sheet->getStyle("A1:{$lastColumn}1")->getFont()->setBold(true);
        $sheet->getStyle("A1:{$lastColumn}1")
            ->getAlignment()
            ->setWrapText(true);

        $sheet->freezePane('A2');
        $sheet->setAutoFilter("A1:{$lastColumn}{$lastRow}");

        foreach (range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $filename = 'SLP_Summary_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(
            function () use ($spreadsheet) {
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
                $spreadsheet->disconnectWorksheets();
            },
            $filename,
            [
                'Content-Type' =>
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]
        );
    }

    /**
     * Return authorized records for the browser's print-to-PDF report.
     */
    public function printData(Request $request)
    {
        $records = $this->filteredQuery($request)
            ->orderByDesc('date_provided')
            ->orderByDesc('evaluation_year')
            ->orderByDesc('monitoring_record_id')
            ->get([
                'monitoring_record_id',
                'evaluation_year',
                'date_provided',
                'mpdos',
                'track',
                'modality',
                'district',
                'lgu',
                'municipality',
                'barangay',
                'total_grant_received',
                'name_of_project',
                'type_of_enterprise',
                'name_of_slpa_slp_participant',
                'enterprises_status',
                'intervention_support',
                'evaluation_recommendation',
                'remarks',
            ]);

        return response()->json([
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'records' => $records,
        ]);
    }

    /**
     * Start with the user's authorized LGU scope.
     *
     * This scope is applied before search/filter conditions, so search
     * OR clauses cannot expose records belonging to another LGU.
     */
    private function scopedQuery(Request $request): Builder
    {
        $query = SLPMonitoringRecord::query()->with('beneficiary');

        $user = $request->user();

        if ($this->userHasRole($user, 'lgu')) {
            $userLgu = mb_strtolower(
                trim((string) ($user?->lgu ?? ''))
            );

            // An LGU account with no assigned LGU must see no records.
            if ($userLgu === '') {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereRaw(
                    'LOWER(TRIM(COALESCE(lgu, ?))) = ?',
                    ['', $userLgu]
                );
            }
        }

        return $query;
    }

    /**
     * Shared filtering for page results, Excel and PDF.
     */
    private function filteredQuery(Request $request): Builder
    {
        $user = $request->user();
        $isLguUser = $this->userHasRole($user, 'lgu');

        return $this->scopedQuery($request)

            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->input('search'));

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where(
                            'name_of_slpa_slp_participant',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere('name_of_project', 'like', "%{$search}%")
                        ->orWhere('type_of_enterprise', 'like', "%{$search}%")
                        ->orWhere('lgu', 'like', "%{$search}%")
                        ->orWhere('municipality', 'like', "%{$search}%")
                        ->orWhere('barangay', 'like', "%{$search}%")
                        ->orWhere('mpdos', 'like', "%{$search}%")
                        ->orWhere('track', 'like', "%{$search}%");
                });
            })

            ->when($request->filled('evaluation_year'), fn ($query) =>
                $query->where(
                    'evaluation_year',
                    $request->input('evaluation_year')
                )
            )

            ->when($request->filled('track'), fn ($query) =>
                $query->where('track', $request->input('track'))
            )

            // Ignore a manually supplied LGU filter for LGU accounts.
            ->when(
                !$isLguUser && $request->filled('lgu'),
                fn ($query) =>
                    $query->where('lgu', $request->input('lgu'))
            )

            ->when($request->filled('municipality'), fn ($query) =>
                $query->where(
                    'municipality',
                    $request->input('municipality')
                )
            )

            ->when($request->filled('barangay'), fn ($query) =>
                $query->where('barangay', $request->input('barangay'))
            )

            ->when($request->filled('type_of_enterprise'), fn ($query) =>
                $query->where(
                    'type_of_enterprise',
                    $request->input('type_of_enterprise')
                )
            )

            ->when($request->filled('enterprises_status'), fn ($query) =>
                $query->where(
                    'enterprises_status',
                    $request->input('enterprises_status')
                )
            );
    }

    /**
     * Support roles stored as an array, JSON string, or comma-separated text.
     */
    private function userHasRole($user, string $expectedRole): bool
    {
        if (!$user) {
            return false;
        }

        $roles = $user->roles ?? [];

        if (is_string($roles)) {
            $decoded = json_decode($roles, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $roles = $decoded;
            } else {
                $roles = explode(',', $roles);
            }
        }

        if (!is_array($roles)) {
            return false;
        }

        foreach ($roles as $role) {
            $roleName = is_array($role)
                ? ($role['name'] ?? '')
                : (is_object($role) ? ($role->name ?? '') : $role);

            if (
                mb_strtolower(trim((string) $roleName))
                === mb_strtolower(trim($expectedRole))
            ) {
                return true;
            }
        }

        return false;
    }
}
