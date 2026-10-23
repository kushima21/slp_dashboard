<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MemberMonitoring;
use App\Models\SLPBeneficiaries;
use App\Models\SLPMonitoringRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SLPMonitoringController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 1. SLP Monitoring Directory
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = SLPBeneficiaries::query()
            ->with('monitoringRecord');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where(
                    'name_of_slpa_slp_participant',
                    'like',
                    "%{$search}%"
                )
                    ->orWhere('name_of_project', 'like', "%{$search}%")
                    ->orWhere('lgu', 'like', "%{$search}%")
                    ->orWhere('city_municipality', 'like', "%{$search}%")
                    ->orWhere('barangay', 'like', "%{$search}%")
                    ->orWhere('beneficiaries_id', $search);
            });
        }

        foreach ([
            'year_implemented',
            'track',
            'modality',
            'district',
            'lgu',
            'type_of_enterprise',
            'enterprise_status',
        ] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->input($field));
            }
        }

        $slpBeneficiaries = $query
            ->orderByDesc('year_implemented')
            ->orderBy('name_of_slpa_slp_participant')
            ->paginate(12)
            ->withQueryString();

        $summary = [
            'total' => SLPBeneficiaries::count(),

            'with_evaluation' => SLPBeneficiaries::whereHas(
                'monitoringRecord'
            )->count(),

            'without_evaluation' => SLPBeneficiaries::whereDoesntHave(
                'monitoringRecord'
            )->count(),
        ];

        return inertia('Admin/SLPMonitoring', [
            'slpBeneficiaries' => $slpBeneficiaries,
            'summary' => $summary,

            'filters' => $request->only([
                'search',
                'year_implemented',
                'track',
                'modality',
                'district',
                'lgu',
                'type_of_enterprise',
                'enterprise_status',
            ]),

            'years' => SLPBeneficiaries::whereNotNull('year_implemented')
                ->distinct()
                ->orderByDesc('year_implemented')
                ->pluck('year_implemented')
                ->values(),

            'districts' => SLPBeneficiaries::whereNotNull('district')
                ->distinct()
                ->orderBy('district')
                ->pluck('district')
                ->values(),

            'lgus' => SLPBeneficiaries::whereNotNull('lgu')
                ->distinct()
                ->orderBy('lgu')
                ->pluck('lgu')
                ->values(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Graph and Evaluation Details
    |--------------------------------------------------------------------------
    */

    public function graph($beneficiaries_id)
    {
        $beneficiary = SLPBeneficiaries::with(
            'monitoringRecord'
        )->findOrFail($beneficiaries_id);

        $monitoringRecord = $beneficiary->monitoringRecord;

        $evaluation = $monitoringRecord;

        $evaluations = $monitoringRecord
            ? collect([$monitoringRecord])
            : collect();

        $members = collect();

        if (
            str_contains(
                strtoupper($beneficiary->type_of_enterprise ?? ''),
                'ASSOCIATION'
            )
        ) {
            $members = Member::query()
                ->where(
                    'beneficiaries_id',
                    $beneficiary->beneficiaries_id
                )
                ->orderBy('member_name')
                ->get();
        }

        return inertia('Monitoring/SLPGraph', [
            'beneficiary' => $beneficiary,
            'monitoringRecord' => $monitoringRecord,
            'members' => $members,
            'evaluation' => $evaluation,
            'evaluations' => $evaluations,

            'evaluationStoreUrl' => route(
                'slp-monitoring.evaluation.store',
                $beneficiary->beneficiaries_id
            ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Save an Individual Evaluation
    |--------------------------------------------------------------------------
    |
    | Saves the evaluation, synchronizes the beneficiary, and updates
    | association member statuses inside one database transaction.
    |
    */

    public function storeEvaluation(
        Request $request,
        $beneficiaries_id
    ) {
        $beneficiary = SLPBeneficiaries::findOrFail(
            $beneficiaries_id
        );

        $isAssociation = str_contains(
            strtoupper($beneficiary->type_of_enterprise ?? ''),
            'ASSOCIATION'
        );

        $validated = $request->validate([
            'evaluation_year' => [
                'required',
                'integer',
                'min:2000',
                'max:2100',
            ],

            'date_provided' => [
                'nullable',
                'date',
            ],

            'quarter_gross_sales' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'quarter_cost_of_sales' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'quarter_gross_profit' => [
                'nullable',
                'numeric',
            ],

            'operating_expenses' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'total_quarterly_net_income' => [
                'nullable',
                'numeric',
            ],

            'cash_in_bank' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'cash_on_hand' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'total_saving' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'enterprises_status' => [
                'required',
                'in:Mainstreaming,Rehabilitation,Closure',
            ],

            'intervention_support' => [
                'nullable',
                'string',
                'max:255',
            ],

            'additional_assessment_fund' => [
                'nullable',
                'string',
                'max:255',
            ],

            'additional_fund_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'required_if:additional_assessment_fund,Input Funds',
            ],

            'evaluation_recommendation' => [
                'nullable',
                'string',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],

            'member_statuses' => [
                $isAssociation ? 'required' : 'nullable',
                'array',
            ],

            'member_statuses.*.member_id' => [
                $isAssociation ? 'required' : 'nullable',
                'string',
                'max:100',
            ],

            'member_statuses.*.status' => [
                $isAssociation ? 'required' : 'nullable',
                'in:Active,Inactive',
            ],
        ]);

        $mpdos = $this->currentMpdo();

        /*
         * date_provided records the date this evaluation is saved.
         * The frontend may still submit a date, but the save date
         * is used to keep manual saves and bulk imports consistent.
         */
        $dateProvided = now()->toDateString();

        $recordData = [
            'mpdos' => $mpdos,
            'evaluation_year' => (int) $validated['evaluation_year'],
            'date_provided' => $dateProvided,

            'track' => $beneficiary->track,
            'modality' => $beneficiary->modality,
            'district' => $beneficiary->district,
            'lgu' => $beneficiary->lgu,
            'municipality' => $beneficiary->city_municipality,
            'barangay' => $beneficiary->barangay,

            'total_grant_received' =>
                $beneficiary->total_grant_received ?? 0,

            'name_of_project' => $beneficiary->name_of_project,
            'type_of_enterprise' => $beneficiary->type_of_enterprise,

            'name_of_slpa_slp_participant' =>
                $beneficiary->name_of_slpa_slp_participant,

            'enterprises_status' =>
                $validated['enterprises_status'],

            'intervention_support' =>
                $validated['intervention_support'] ?? null,

            'evaluation_recommendation' =>
                $validated['evaluation_recommendation'] ?? null,

            'remarks' => $validated['remarks'] ?? null,

            'quarter_gross_sales' =>
                $validated['quarter_gross_sales'] ?? 0,

            'quarter_cost_of_sales' =>
                $validated['quarter_cost_of_sales'] ?? 0,

            'quarter_gross_profit' =>
                $validated['quarter_gross_profit'] ?? 0,

            'operating_expenses' =>
                $validated['operating_expenses'] ?? 0,

            'total_quarterly_net_income' =>
                $validated['total_quarterly_net_income'] ?? 0,

            'cash_in_bank' => $validated['cash_in_bank'] ?? 0,
            'cash_on_hand' => $validated['cash_on_hand'] ?? 0,
            'total_saving' => $validated['total_saving'] ?? 0,

            'additional_assessment_fund' =>
                $validated['additional_assessment_fund'] ?? null,

            'additional_fund_amount' =>
                ($validated['additional_assessment_fund'] ?? null)
                    === 'Input Funds'
                    ? ($validated['additional_fund_amount'] ?? null)
                    : null,
        ];

        DB::transaction(function () use (
            $beneficiary,
            $validated,
            $recordData,
            $isAssociation
        ) {
            /*
             * Update beneficiary and monitoring record together.
             */
            $this->synchronizeMonitoringRecord(
                $beneficiary,
                $recordData
            );

            /*
             * Update association members when applicable.
             */
            if ($isAssociation) {
                $submittedMembers = collect(
                    $validated['member_statuses'] ?? []
                );

                if (
                    $submittedMembers->pluck('member_id')
                        ->unique()
                        ->count() !== $submittedMembers->count()
                ) {
                    throw ValidationException::withMessages([
                        'member_statuses' =>
                            'A member was submitted more than once.',
                    ]);
                }

                foreach ($submittedMembers as $row) {
                    $member = Member::query()
                        ->where(
                            'beneficiaries_id',
                            $beneficiary->beneficiaries_id
                        )
                        ->where('member_id', $row['member_id'])
                        ->first();

                    if (!$member) {
                        throw ValidationException::withMessages([
                            'member_statuses' =>
                                'A submitted member does not belong to this beneficiary. Refresh the page and try again.',
                        ]);
                    }

                    $assessedStatus = $row['status'];

                    $member->status = $assessedStatus;
                    $member->save();

                    MemberMonitoring::updateOrCreate(
                        [
                            'beneficiaries_id' =>
                                $beneficiary->beneficiaries_id,

                            'member_id' => $member->member_id,

                            'evaluation_year' =>
                                $validated['evaluation_year'],
                        ],
                        [
                            'status' => $assessedStatus,

                            'date_provided' =>
                                $recordData['date_provided'],

                            'mpdos' => $recordData['mpdos'],

                            'enterprise_status' =>
                                $recordData['enterprises_status'],

                            'remarks' =>
                                $validated['remarks'] ?? null,
                        ]
                    );
                }
            }
        });

        return redirect()
            ->back()
            ->with(
                'success',
                'Evaluation saved successfully. The beneficiary status, date provided, MPDO evaluator, financial evaluation, and association member statuses have been updated.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Bulk Evaluation Import
    |--------------------------------------------------------------------------
    |
    | Accepts CSV, XLS, and XLSX files using the requested template.
    | Participant names are matched to SLPBeneficiaries records.
    | Ambiguous names or invalid rows stop the transaction.
    |
    */

    public function bulkEvaluation(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls,csv',
                'max:10240',
            ],
        ]);

        $mpdos = $this->currentMpdo();
        $dateProvided = now()->toDateString();

        try {
            $spreadsheet = IOFactory::load(
                $request->file('file')->getRealPath()
            );

            $sheetRows = $spreadsheet
                ->getActiveSheet()
                ->toArray(null, true, true, false);
        } catch (\Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'file' =>
                    'The uploaded file could not be read. Please upload a valid CSV or Excel template.',
            ]);
        }

        if (count($sheetRows) < 2) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded file contains no evaluation rows.',
            ]);
        }

        /*
         * Normalize headers and support the requested template spelling:
         * type_of_enterpris -> type_of_enterprise.
         */
        $headers = array_map(
            fn ($header) => strtolower(trim((string) $header)),
            array_shift($sheetRows)
        );

        $headerAliases = [
            'type_of_enterpris' => 'type_of_enterprise',
        ];

        $headers = array_map(
            fn ($header) => $headerAliases[$header] ?? $header,
            $headers
        );

        if (count($headers) !== count(array_unique($headers))) {
            throw ValidationException::withMessages([
                'file' =>
                    'The template contains duplicate column headers. Please download a fresh template.',
            ]);
        }

        $requiredHeaders = [
            'evaluation_year',
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
        ];

        $missingHeaders = array_values(
            array_diff($requiredHeaders, $headers)
        );

        if ($missingHeaders) {
            throw ValidationException::withMessages([
                'file' =>
                    'Missing required columns: ' .
                    implode(', ', $missingHeaders),
            ]);
        }

        $importedCount = 0;
        $updatedCount = 0;
        $seenParticipants = [];

        DB::transaction(function () use (
            $sheetRows,
            $headers,
            $mpdos,
            $dateProvided,
            &$importedCount,
            &$updatedCount,
            &$seenParticipants
        ) {
            foreach ($sheetRows as $index => $values) {
                $rowNumber = $index + 2;

                /*
                 * Skip blank spreadsheet rows.
                 */
                if (
                    collect($values)->every(
                        fn ($value) => trim((string) $value) === ''
                    )
                ) {
                    continue;
                }

                $row = [];

                foreach ($headers as $columnIndex => $header) {
                    $row[$header] = $values[$columnIndex] ?? null;
                }

                $participantName = trim((string) (
                    $row['name_of_slpa_slp_participant'] ?? ''
                ));

                $normalizedName = $this->normalizeParticipantName(
                    $participantName
                );

                if ($normalizedName === '') {
                    throw ValidationException::withMessages([
                        'file' =>
                            "Row {$rowNumber}: participant name is required.",
                    ]);
                }

                /*
                 * Prevent duplicate participant rows in a single file.
                 */
                if (isset($seenParticipants[$normalizedName])) {
                    throw ValidationException::withMessages([
                        'file' =>
                            "Row {$rowNumber}: \"{$participantName}\" appears more than once in this file. Keep one row per participant.",
                    ]);
                }

                $seenParticipants[$normalizedName] = true;

                /*
                 * Validate row data before attempting to save.
                 */
                $row['evaluation_year'] = is_numeric(
                    $row['evaluation_year'] ?? null
                )
                    ? (int) $row['evaluation_year']
                    : $row['evaluation_year'];

                $row['total_grant_received'] = is_numeric(
                    $row['total_grant_received'] ?? null
                )
                    ? (float) $row['total_grant_received']
                    : $row['total_grant_received'];

                $validator = Validator::make($row, [
                    'evaluation_year' => [
                        'required',
                        'integer',
                        'min:2000',
                        'max:2100',
                    ],

                    'track' => ['required', 'string', 'max:100'],
                    'modality' => ['required', 'string', 'max:100'],
                    'district' => ['required', 'string', 'max:100'],
                    'lgu' => ['required', 'string', 'max:255'],
                    'municipality' => ['required', 'string', 'max:255'],
                    'barangay' => ['required', 'string', 'max:255'],

                    'total_grant_received' => [
                        'required',
                        'numeric',
                        'min:0',
                    ],

                    'name_of_project' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'type_of_enterprise' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'name_of_slpa_slp_participant' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'enterprises_status' => [
                        'required',
                        'in:Mainstreaming,Rehabilitation,Closure',
                    ],

                    'intervention_support' => [
                        'nullable',
                        'string',
                        'max:255',
                    ],

                    'evaluation_recommendation' => [
                        'nullable',
                        'string',
                    ],

                    'remarks' => [
                        'nullable',
                        'string',
                    ],
                ]);

                if ($validator->fails()) {
                    $messages = [];

                    foreach ($validator->errors()->all() as $message) {
                        $messages[] = "Row {$rowNumber}: {$message}";
                    }

                    throw ValidationException::withMessages([
                        'file' => $messages,
                    ]);
                }

                /*
                 * Find the original beneficiary by participant name.
                 */
                $beneficiary = $this->findBeneficiaryByParticipantName(
                    $participantName,
                    $rowNumber
                );

                $wasExisting = SLPMonitoringRecord::query()
                    ->where(
                        'beneficiaries_id',
                        $beneficiary->beneficiaries_id
                    )
                    ->exists();

                $recordData = [
                    'mpdos' => $mpdos,
                    'evaluation_year' => $row['evaluation_year'],
                    'date_provided' => $dateProvided,

                    'track' => trim((string) $row['track']),
                    'modality' => trim((string) $row['modality']),
                    'district' => trim((string) $row['district']),
                    'lgu' => trim((string) $row['lgu']),
                    'municipality' => trim((string) $row['municipality']),
                    'barangay' => trim((string) $row['barangay']),

                    'total_grant_received' =>
                        $row['total_grant_received'],

                    'name_of_project' =>
                        trim((string) $row['name_of_project']),

                    'type_of_enterprise' =>
                        trim((string) $row['type_of_enterprise']),

                    'name_of_slpa_slp_participant' =>
                        $participantName,

                    'enterprises_status' =>
                        $row['enterprises_status'],

                    'intervention_support' =>
                        $row['intervention_support'] ?? null,

                    'evaluation_recommendation' =>
                        $row['evaluation_recommendation'] ?? null,

                    'remarks' => $row['remarks'] ?? null,
                ];

                $this->synchronizeMonitoringRecord(
                    $beneficiary,
                    $recordData
                );

                if ($wasExisting) {
                    $updatedCount++;
                } else {
                    $importedCount++;
                }
            }

            if ($importedCount + $updatedCount === 0) {
                throw ValidationException::withMessages([
                    'file' =>
                        'No valid evaluation rows were found in the uploaded file.',
                ]);
            }
        });

        return redirect()
            ->back()
            ->with(
                'success',
                "Bulk evaluation completed successfully. {$importedCount} new monitoring record(s) added and {$updatedCount} existing record(s) updated. Beneficiary status, date provided, and MPDO evaluator were synchronized."
            );
    }

    
/*
|--------------------------------------------------------------------------
| Shared Monitoring Synchronization
|--------------------------------------------------------------------------
|
| Updates the beneficiary's enterprise status and saves the evaluation
| date, MPDO evaluator, and evaluation details in the monitoring record.
|
*/

private function synchronizeMonitoringRecord(
    SLPBeneficiaries $beneficiary,
    array $data
): SLPMonitoringRecord {
    $status = $data['enterprises_status'];
    $dateProvided = now()->toDateString();
    $mpdos = $data['mpdos'];

    // Update only columns that exist in slp_beneficiaries.
    $beneficiary->enterprise_status = $status;
    $beneficiary->save();

    // Save the evaluation details, date, and evaluator in the
    // s_l_p_monitoring_records table.
    return SLPMonitoringRecord::updateOrCreate(
        [
            'beneficiaries_id' => $beneficiary->beneficiaries_id,
        ],
        array_merge($data, [
            'beneficiaries_id' => $beneficiary->beneficiaries_id,
            'enterprises_status' => $status,
            'date_provided' => $dateProvided,
            'mpdos' => $mpdos,
        ])
    );
}


    /*
    |--------------------------------------------------------------------------
    | 6. Current MPDO Evaluator
    |--------------------------------------------------------------------------
    */

    private function currentMpdo(): string
    {
        $user = Auth::user();

        if (!$user) {
            abort(401, 'You must be logged in to save an evaluation.');
        }

        $lastName = trim((string) (
            $user->lastname
            ?? $user->last_name
            ?? $user->surname
            ?? ''
        ));

        if ($lastName === '') {
            throw ValidationException::withMessages([
                'mpdos' =>
                    'Your account must have a last name before an evaluation can be saved.',
            ]);
        }

        return 'MPDO ' . $lastName;
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Participant Name Normalization
    |--------------------------------------------------------------------------
    */

    private function normalizeParticipantName(?string $name): string
    {
        $name = preg_replace(
            '/\s+/',
            ' ',
            trim((string) $name)
        );

        return mb_strtolower($name);
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Match the SLP Beneficiary
    |--------------------------------------------------------------------------
    |
    | Names are matched case-insensitively after trimming whitespace.
    | Ambiguous matches are rejected to protect the wrong beneficiary
    | from being updated.
    |
    */

    private function findBeneficiaryByParticipantName(
        string $participantName,
        int $rowNumber
    ): SLPBeneficiaries {
        $normalizedName = $this->normalizeParticipantName(
            $participantName
        );

        if ($normalizedName === '') {
            throw ValidationException::withMessages([
                'file' =>
                    "Row {$rowNumber}: name_of_slpa_slp_participant is required.",
            ]);
        }

        /*
         * Load potential matches and normalize them in PHP as well,
         * so multiple spaces within a name can be handled consistently.
         */
        $matches = SLPBeneficiaries::query()
            ->whereRaw(
                'LOWER(TRIM(name_of_slpa_slp_participant)) = ?',
                [$normalizedName]
            )
            ->limit(2)
            ->get();

        /*
         * If the exact SQL match did not find anything, handle internal
         * whitespace differences by checking the participant directory.
         */
        if ($matches->isEmpty()) {
            $matches = SLPBeneficiaries::query()
                ->whereNotNull('name_of_slpa_slp_participant')
                ->get()
                ->filter(function ($beneficiary) use ($normalizedName) {
                    return $this->normalizeParticipantName(
                        $beneficiary->name_of_slpa_slp_participant
                    ) === $normalizedName;
                })
                ->take(2)
                ->values();
        }

        if ($matches->isEmpty()) {
            throw ValidationException::withMessages([
                'file' =>
                    "Row {$rowNumber}: no SLP beneficiary was found for \"{$participantName}\".",
            ]);
        }

        if ($matches->count() > 1) {
            throw ValidationException::withMessages([
                'file' =>
                    "Row {$rowNumber}: more than one beneficiary matches \"{$participantName}\". Resolve duplicate names before importing.",
            ]);
        }

        return $matches->first();
    }
}