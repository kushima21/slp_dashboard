<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarangayController extends Controller
{
    /**
     * Display Barangay Management page.
     */
    public function index()
    {
        $barangays = Barangay::with('municipalityRelation')
            ->orderByDesc('barangay_id')
            ->get();

        $municipalities = Municipality::query()
            ->where('status', 'Active')
            ->orderBy('municipality')
            ->get();

        return Inertia::render('Admin/Barangay', [
            'barangays' => $barangays,
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * Store a new Barangay.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'barangay_name' => [
                'required',
                'string',
                'max:255',
            ],

            'purok' => [
                'nullable',
                'string',
                'max:255',
            ],

            'municipality_id' => [
                'required',
                'integer',
                'exists:municipalities,municipality_id',
            ],

            'status' => [
                'required',
                'in:Active,Inactive',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get Selected Municipality
        |--------------------------------------------------------------------------
        */
        $municipality = Municipality::where(
            'municipality_id',
            $validated['municipality_id']
        )->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Create Barangay
        |--------------------------------------------------------------------------
        */
        Barangay::create([
            'barangay_name' => $validated['barangay_name'],
            'purok' => $validated['purok'] ?? null,

            // Foreign key
            'municipality_id' => $municipality->municipality_id,

            // Municipality information
            'municipality' => $municipality->municipality,
            'region' => $municipality->region,
            'province' => $municipality->province,
            'zipcode' => $municipality->zipcode,

            'status' => $validated['status'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Barangay created successfully.');
    }

    /**
     * Update an existing Barangay.
     */
    public function update(Request $request, $id)
    {
        $barangay = Barangay::findOrFail($id);

        $validated = $request->validate([
            'barangay_name' => [
                'required',
                'string',
                'max:255',
            ],

            'purok' => [
                'nullable',
                'string',
                'max:255',
            ],

            'municipality_id' => [
                'required',
                'integer',
                'exists:municipalities,municipality_id',
            ],

            'status' => [
                'required',
                'in:Active,Inactive',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get Selected Municipality
        |--------------------------------------------------------------------------
        */
        $municipality = Municipality::where(
            'municipality_id',
            $validated['municipality_id']
        )->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Update Barangay
        |--------------------------------------------------------------------------
        */
        $barangay->update([
            'barangay_name' => $validated['barangay_name'],
            'purok' => $validated['purok'] ?? null,

            // Foreign key
            'municipality_id' => $municipality->municipality_id,

            // Municipality information
            'municipality' => $municipality->municipality,
            'region' => $municipality->region,
            'province' => $municipality->province,
            'zipcode' => $municipality->zipcode,

            'status' => $validated['status'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Barangay updated successfully.');
    }

    /**
     * Delete Barangay.
     */
    public function destroy($id)
    {
        $barangay = Barangay::findOrFail($id);

        $barangay->delete();

        return redirect()
            ->back()
            ->with('success', 'Barangay deleted successfully.');
    }
}

