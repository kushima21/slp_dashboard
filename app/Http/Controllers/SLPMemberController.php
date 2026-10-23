<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SLPBeneficiaries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SLPMemberController extends Controller
{
    /**
     * Store a new member linked to an SLP beneficiary.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'beneficiaries_id' => [
                'required',
                'integer',
            ],

            'name_of_slpa_slp_participant' => [
                'nullable',
                'string',
                'max:255',
            ],

            'member_name' => [
                'required',
                'string',
                'max:255',
            ],

            'gender' => [
                'required',
                Rule::in(['Male', 'Female', 'Other']),
            ],

            'birthdate' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'role' => [
                'required',
                Rule::in([
                    'President',
                    'Vice President',
                    'Secretary',
                    'Assistant Secretary',
                    'Treasurer',
                    'Assistant Treasurer',
                    'Auditor',
                    'Public Relations Officer (PRO)',
                    'Board Member',
                    'Committee Member',
                    'Member',
                ]),
            ],

            'contact_number' => [
                'required',
                'string',
                'max:30',
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

            'purok' => [
                'required',
                'string',
                'max:150',
            ],

            'status' => [
                'required',
                Rule::in(['Active', 'Inactive']),
            ],
        ]);

        // Retrieve the real beneficiary record.
        $beneficiary = SLPBeneficiaries::findOrFail(
            $validated['beneficiaries_id']
        );

        // Generate and save the member record.
        DB::transaction(function () use ($validated, $beneficiary) {
            $year = now()->year;

            do {
                $memberId = 'SLM-' . $year . '-' .
                    strtoupper(bin2hex(random_bytes(4)));
            } while (
                Member::where('member_id', $memberId)->exists()
            );

            Member::create([
                'member_id' => $memberId,

                'member_name' => trim($validated['member_name']),

                'beneficiaries_id' => $beneficiary->getKey(),

                // Use the participant name stored in the database.
                'participant_name' =>
                    $beneficiary->name_of_slpa_slp_participant,

                'gender' => $validated['gender'],

                'birthdate' => $validated['birthdate'],

                'year_joined' => $year,

                'role' => $validated['role'],

                'contact_number' => trim(
                    $validated['contact_number']
                ),

                // Map the React field to the database column.
                'municipality' => trim(
                    $validated['city_municipality']
                ),

                'barangay' => trim($validated['barangay']),

                'purok' => trim($validated['purok']),

                'status' => $validated['status'],
            ]);
        });

        return back()->with(
            'success',
            'Member registered successfully.'
        );
    }
}
