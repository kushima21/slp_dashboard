<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Member;
use App\Models\Municipality;
use App\Models\SLPBeneficiaries;
use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SLPBeneficiariesController extends Controller
{
    /**
     * Required CSV columns.
     *
     * These names must match the downloaded CSV template.
     * Their order in the uploaded CSV does not matter.
     */
    private function requiredCsvHeaders(): array
    {
        return [
            'year_implemented',
            'track',
            'modality',
            'district',
            'lgu',
            'city_municipality',
            'barangay',
            'total_grant_received',
            'name_of_project',
            'type_of_enterprise',
            'name_of_slpa_slp_participant',
            'enterprise_status',
        ];
    }

    /**
     * Display SLP beneficiary records, filters and summary statistics.
     */
    public function index(Request $request)
    {
        $query = SLPBeneficiaries::query();

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('name_of_project', 'like', "%{$search}%")
                    ->orWhere(
                        'name_of_slpa_slp_participant',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere('lgu', 'like', "%{$search}%")
                    ->orWhere(
                        'city_municipality',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere('barangay', 'like', "%{$search}%")
                    ->orWhere(
                        'type_of_enterprise',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere('track', 'like', "%{$search}%")
                    ->orWhere('modality', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere(
                        'enterprise_status',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */
        $filtersToApply = [
            'year_implemented',
            'track',
            'modality',
            'district',
            'lgu',
            'type_of_enterprise',
            'enterprise_status',
        ];

        foreach ($filtersToApply as $filter) {
            if ($request->filled($filter)) {
                $query->where(
                    $filter,
                    $request->input($filter)
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Paginated beneficiaries
        |--------------------------------------------------------------------------
        */
        $beneficiaries = $query
            ->orderByDesc('year_implemented')
            ->orderByDesc('beneficiaries_id')
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Summary statistics
        |--------------------------------------------------------------------------
        */
        $summary = [
            'total' => SLPBeneficiaries::count(),

            'individual' => SLPBeneficiaries::where(
                'type_of_enterprise',
                'INDIVIDUAL'
            )->count(),

            'association' => SLPBeneficiaries::where(
                'type_of_enterprise',
                'ASSOCIATION'
            )->count(),

            'grant' => (float) SLPBeneficiaries::sum(
                'total_grant_received'
            ),

            'mainstreaming' => SLPBeneficiaries::where(
                'enterprise_status',
                'Mainstreaming'
            )->count(),

            'rehabilitation' => SLPBeneficiaries::where(
                'enterprise_status',
                'Rehabilitation'
            )->count(),

            'closure' => SLPBeneficiaries::where(
                'enterprise_status',
                'Closure'
            )->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Return Inertia page
        |--------------------------------------------------------------------------
        */
        return Inertia::render('Admin/SLPBeneficiaries', [
            'beneficiaries' => $beneficiaries,

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

            'years' => SLPBeneficiaries::query()
                ->select('year_implemented')
                ->distinct()
                ->orderByDesc('year_implemented')
                ->pluck('year_implemented'),

            'tracks' => Track::query()
                ->where('status', 'Active')
                ->orderBy('category_name')
                ->get([
                    'id',
                    'category_name',
                    'track_type',
                    'default_modalities',
                ]),

            'municipalities' => Municipality::query()
                ->where('status', 'Active')
                ->orderBy('municipality')
                ->get([
                    'municipality_id',
                    'municipality',
                    'province',
                    'region',
                ]),

            'barangays' => Barangay::query()
                ->where('status', 'Active')
                ->orderBy('barangay_name')
                ->get([
                    'barangay_id',
                    'barangay_name',
                    'municipality_id',
                ]),
        ]);
    }

    /**
     * Store a new SLP beneficiary.
     */
    public function store(Request $request)
    {
        $data = $this->validateBeneficiary($request);

        SLPBeneficiaries::create($data);

        return redirect()
            ->route('slp-beneficiaries.index')
            ->with('success', 'SLP beneficiary added successfully.');
    }

    /**
     * Update an existing SLP beneficiary.
     */
    public function update(Request $request, $id)
    {
        $beneficiary = SLPBeneficiaries::findOrFail($id);

        $beneficiary->update(
            $this->validateBeneficiary($request)
        );

        return redirect()
            ->route('slp-beneficiaries.index')
            ->with('success', 'SLP beneficiary updated successfully.');
    }

    /**
     * Delete an SLP beneficiary.
     */
    public function destroy($id)
    {
        SLPBeneficiaries::findOrFail($id)->delete();

        return redirect()
            ->route('slp-beneficiaries.index')
            ->with('success', 'SLP beneficiary deleted successfully.');
    }

    /**
     * Validation rules shared by manual entry and CSV import.
     */
    private function beneficiaryRules(): array
    {
        $districts = array_map(
            fn ($number) => $this->districtName($number),
            range(1, 12)
        );

        $lgus = array_map(
            fn ($number) => "LGU {$number}",
            range(1, 12)
        );

        return [
            'year_implemented' => [
                'required',
                'integer',
                'min:2000',
                'max:2100',
            ],

            'track' => [
                'required',
                Rule::in(['MD', 'EF']),
            ],

            'modality' => [
                'required',
                Rule::in(['SFC', 'PEAF', 'ST']),
            ],

            'district' => [
                'required',
                Rule::in($districts),
            ],

            'lgu' => [
                'required',
                Rule::in($lgus),
            ],

            'city_municipality' => [
                'required',
                'string',
                'max:150',
            ],

            'barangay' => [
                'required',
                'string',
                'max:150',
            ],

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
                Rule::in(['ASSOCIATION', 'INDIVIDUAL']),
            ],

            'name_of_slpa_slp_participant' => [
                'required',
                'string',
                'max:255',
            ],

            'enterprise_status' => [
                'required',
                Rule::in([
                    'Mainstreaming',
                    'Rehabilitation',
                    'Closure',
                ]),
            ],
        ];
    }

    /**
     * Validate a manual create or update request.
     */
    private function validateBeneficiary(Request $request): array
    {
        return $request->validate($this->beneficiaryRules());
    }

    /**
     * Format a district label.
     */
    private function districtName(int $number): string
    {
        $suffix = match ($number % 100) {
            11, 12, 13 => 'th',

            default => match ($number % 10) {
                1 => 'st',
                2 => 'nd',
                3 => 'rd',
                default => 'th',
            },
        };

        return "{$number}{$suffix} District";
    }

    /**
     * Normalize and validate CSV headers.
     *
     * Required headers must all exist.
     * Additional uniquely named columns are allowed.
     * Duplicate or blank headers are rejected.
     */
    
private function validateCsvHeaders(array $headers): array
{
    $headers = array_map(function ($header) {
        $header = (string) $header;

        // Remove UTF-8 BOM from the first header, if present.
        $header = preg_replace('/^\xEF\xBB\xBF/', '', $header);

        // Normalize non-breaking spaces.
        $header = str_replace("\xC2\xA0", ' ', $header);

        return strtolower(trim($header));
    }, $headers);

    if (empty($headers)) {
        throw new \RuntimeException(
            'The uploaded CSV file has no header row.'
        );
    }

    // Reject empty column names.
    $blankColumns = [];

    foreach ($headers as $index => $header) {
        if ($header === '') {
            $blankColumns[] = $index + 1;
        }
    }

    if (!empty($blankColumns)) {
        throw new \RuntimeException(
            'Blank column header(s) found at column(s): '
            . implode(', ', $blankColumns)
            . '. Remove unnamed columns and export the CSV again.'
        );
    }

    // Reject duplicate column names after normalization.
    $headerCounts = array_count_values($headers);
    $duplicates = [];

    foreach ($headerCounts as $header => $count) {
        if ($count > 1) {
            $duplicates[] = $header;
        }
    }

    if (!empty($duplicates)) {
        throw new \RuntimeException(
            'Duplicate CSV column names found: '
            . implode(', ', $duplicates)
            . '. Every column must have a unique name.'
        );
    }

    // Ensure every required field exists.
    $requiredHeaders = $this->requiredCsvHeaders();

    $missingHeaders = array_values(
        array_diff($requiredHeaders, $headers)
    );

    if (!empty($missingHeaders)) {
        throw new \RuntimeException(
            'The CSV is missing required column(s): '
            . implode(', ', $missingHeaders)
            . '. Download the template and keep the required column names unchanged.'
        );
    }

    return $headers;
}


    /**
     * Import beneficiary records from a CSV file.
     *
     * Required template headers:
     * year_implemented, track, modality, district, lgu,
     * city_municipality, barangay, total_grant_received,
     * name_of_project, type_of_enterprise,
     * name_of_slpa_slp_participant, enterprise_status
     *
     * Extra uniquely named columns are permitted but ignored.
     * Valid rows are imported; invalid rows are reported and skipped.
     */
    public function bulkImport(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Validate uploaded file
        |--------------------------------------------------------------------------
        */
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:csv,txt',
                'max:10240',
            ],
        ]);

        $uploadedFile = $request->file('file');

        if (!$uploadedFile || !$uploadedFile->isValid()) {
            return back()->withErrors([
                'file' => 'The uploaded file is invalid. Please upload a valid CSV file.',
            ]);
        }

        $path = $uploadedFile->getRealPath();
        $file = fopen($path, 'r');

        if ($file === false) {
            return back()->withErrors([
                'file' => 'Unable to read the uploaded CSV file.',
            ]);
        }

        $imported = 0;
        $skipped = 0;
        $rowNumber = 1;
        $errors = [];
        $transactionStarted = false;

        try {
            /*
            |--------------------------------------------------------------------------
            | Read and validate the header row
            |--------------------------------------------------------------------------
            */
            $rawHeaders = fgetcsv($file);

            if (
                $rawHeaders === false ||
                $rawHeaders === null ||
                count($rawHeaders) === 0
            ) {
                return back()->withErrors([
                    'file' => 'The uploaded CSV file is empty or has no header row.',
                ]);
            }

            try {
                $headers = $this->validateCsvHeaders($rawHeaders);
            } catch (\RuntimeException $exception) {
                return back()->withErrors([
                    'file' => $exception->getMessage(),
                ]);
            }

            $requiredHeaders = $this->requiredCsvHeaders();

            /*
            |--------------------------------------------------------------------------
            | Start database transaction
            |--------------------------------------------------------------------------
            */
            DB::beginTransaction();
            $transactionStarted = true;

            /*
            |--------------------------------------------------------------------------
            | Process CSV rows
            |--------------------------------------------------------------------------
            */
            while (($row = fgetcsv($file)) !== false) {
                $rowNumber++;

                // Skip completely blank rows.
                if (
                    count(
                        array_filter(
                            $row,
                            fn ($value) => trim((string) $value) !== ''
                        )
                    ) === 0
                ) {
                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Check row column count
                |--------------------------------------------------------------------------
                */
                if (count($row) !== count($headers)) {
                    $skipped++;

                    $errors[] = "Row {$rowNumber}: the number of columns "
                        . 'does not match the header.';

                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Combine headers and row values
                |--------------------------------------------------------------------------
                */
                $combined = array_combine(
                    $headers,
                    array_map(
                        fn ($value) => trim((string) $value),
                        $row
                    )
                );

                if ($combined === false) {
                    $skipped++;

                    $errors[] = "Row {$rowNumber}: unable to read the row.";

                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Ignore extra CSV columns
                |--------------------------------------------------------------------------
                | Extra columns are permitted if their names are unique.
                | Only the required beneficiary fields are saved.
                */
                $record = array_intersect_key(
                    $combined,
                    array_flip($requiredHeaders)
                );

                /*
                |--------------------------------------------------------------------------
                | Normalize values
                |--------------------------------------------------------------------------
                */
                $record['track'] = strtoupper(
                    trim($record['track'] ?? '')
                );

                $record['modality'] = strtoupper(
                    trim($record['modality'] ?? '')
                );

                $record['type_of_enterprise'] = strtoupper(
                    trim($record['type_of_enterprise'] ?? '')
                );

                $record['district'] = trim(
                    $record['district'] ?? ''
                );

                $record['lgu'] = strtoupper(
                    trim($record['lgu'] ?? '')
                );

                // Normalize enterprise status regardless of letter casing.
                $status = strtolower(
                    trim($record['enterprise_status'] ?? '')
                );

                $record['enterprise_status'] = match ($status) {
                    'mainstreaming' => 'Mainstreaming',
                    'rehabilitation' => 'Rehabilitation',
                    'closure' => 'Closure',
                    default => trim(
                        $record['enterprise_status'] ?? ''
                    ),
                };

                /*
                |--------------------------------------------------------------------------
                | Validate individual record
                |--------------------------------------------------------------------------
                */
                $validator = Validator::make(
                    $record,
                    $this->beneficiaryRules()
                );

                if ($validator->fails()) {
                    $skipped++;

                    $errors[] = "Row {$rowNumber}: "
                        . implode(
                            ' ',
                            $validator->errors()->all()
                        );

                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Insert validated record
                |--------------------------------------------------------------------------
                */
                SLPBeneficiaries::create(
                    $validator->validated()
                );

                $imported++;
            }

            /*
            |--------------------------------------------------------------------------
            | No records were imported
            |--------------------------------------------------------------------------
            */
            if ($imported === 0) {
                DB::rollBack();
                $transactionStarted = false;

                $details = !empty($errors)
                    ? ' ' . implode(' | ', array_slice($errors, 0, 5))
                    : ' The CSV contains no data rows to import.';

                return back()->withErrors([
                    'file' => 'No records were imported.' . $details,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Commit successfully imported rows
            |--------------------------------------------------------------------------
            */
            DB::commit();
            $transactionStarted = false;
        } catch (\Throwable $exception) {
            /*
            |--------------------------------------------------------------------------
            | Roll back database transaction on unexpected failure
            |--------------------------------------------------------------------------
            */
            if ($transactionStarted && DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            report($exception);

            return back()->withErrors([
                'file' => 'The import failed because of a processing or database error. '
                    . 'Please check the CSV file and try again.',
            ]);
        } finally {
            if (is_resource($file)) {
                fclose($file);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Prepare import result message
        |--------------------------------------------------------------------------
        */
        $message = "{$imported} beneficiary record(s) imported successfully.";

        if ($skipped > 0) {
            $message .= " {$skipped} row(s) were skipped.";

            if (!empty($errors)) {
                $message .= ' Details: '
                    . implode(' | ', array_slice($errors, 0, 5));
            }
        }

        return redirect()
            ->route('slp-beneficiaries.index')
            ->with('success', $message);
    }

  
public function manage($beneficiaries_id)
{
    $beneficiary = SLPBeneficiaries::with('monitoringRecord')
        ->findOrFail($beneficiaries_id);

    // Fetch only members belonging to this beneficiary.
    $members = Member::query()
        ->where('beneficiaries_id', $beneficiary->beneficiaries_id)
        ->orderBy('member_name')
        ->get([
            'id',
            'member_id',
            'beneficiaries_id',
            'participant_name',
            'member_name',
            'gender',
            'birthdate',
            'year_joined',
            'role',
            'contact_number',
            'municipality',
            'barangay',
            'purok',
            'status',
            'created_at',
        ]);

    // Attach the member records to the beneficiary data.
    $beneficiary->setRelation('members', $members);

    return Inertia::render('Manage/ManageAssociation', [
        'beneficiary' => $beneficiary,
        'monitoringData' => $beneficiary->monitoringRecord,
    ]);
}

}