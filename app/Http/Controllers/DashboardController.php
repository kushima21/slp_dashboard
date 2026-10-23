<?php

namespace App\Http\Controllers;

use App\Models\SLPMonitoringRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Support roles stored as either an array or JSON string.
        $roles = $user->roles ?? [];

        if (is_string($roles)) {
            $roles = json_decode($roles, true) ?? [];
        }

        if (! is_array($roles)) {
            $roles = [];
        }

        $roles = array_map(
            fn ($role) => strtolower(trim((string) $role)),
            $roles
        );

        $isLguUser = in_array('lgu', $roles, true);
        $userLgu = trim((string) ($user->lgu ?? ''));

        $query = SLPMonitoringRecord::query()
            ->with('beneficiary:beneficiaries_id,lgu')
            ->orderByDesc('evaluation_year')
            ->orderByDesc('date_provided')
            ->orderByDesc('monitoring_record_id');

        /*
         * LGU ROLE RESTRICTION
         *
         * Example:
         * Logged-in user's role = lgu
         * Logged-in user's lgu  = LGU 3
         *
         * Only records whose related beneficiary has lgu = LGU 3
         * will be returned.
         */
        if ($isLguUser) {
            if ($userLgu === '') {
                // Fail closed if an LGU user has no assigned LGU.
                $query->whereRaw('1 = 0');
            } else {
                $query->whereHas('beneficiary', function ($beneficiaryQuery) use ($userLgu) {
                    $beneficiaryQuery->whereRaw(
                        'LOWER(TRIM(lgu)) = ?',
                        [strtolower($userLgu)]
                    );
                });
            }
        }

        $records = $query->get()->map(function ($record) {
            $beneficiary = $record->beneficiary;

            return [
                'id' => $record->monitoring_record_id,
                'beneficiaries_id' => $record->beneficiaries_id,
                'mpdos' => $record->mpdos,
                'year' => $record->evaluation_year,
                'date_provided' => $record->date_provided?->format('Y-m-d'),

                'track' => $record->track,
                'modality' => $record->modality,
                'district' => $record->district,

                // For display, use the beneficiary's LGU value.
                'lgu' => $beneficiary?->lgu ?? $record->lgu,

                'municipality' => $record->municipality,
                'barangay' => $record->barangay,

                'total_grant_received' => (float) (
                    $record->total_grant_received ?? 0
                ),

                'name_of_project' => $record->name_of_project,
                'type_of_enterprise' => $record->type_of_enterprise,
                'participant' => $record->name_of_slpa_slp_participant,
                'status' => $record->enterprises_status,

                'intervention_support' => $record->intervention_support,
                'evaluation_recommendation' => $record->evaluation_recommendation,
                'remarks' => $record->remarks,
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'records' => $records->values(),

            'access' => [
                'role' => $isLguUser ? 'lgu' : 'other',
                'lgu' => $isLguUser ? $userLgu : null,
                'restricted' => $isLguUser,
            ],

            'filterOptions' => [
                'years' => $records->pluck('year')
                    ->filter()
                    ->unique()
                    ->sortDesc()
                    ->values(),

                'lgus' => $records->pluck('lgu')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),

                'municipalities' => $records->pluck('municipality')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),

                'barangays' => $records->pluck('barangay')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),

                'participants' => $records->pluck('type_of_enterprise')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),
            ],
        ]);
    }
}
