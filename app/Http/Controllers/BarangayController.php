<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarangayController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Barangay', [
            'barangays' => Barangay::latest('barangay_id')->get(),
            'municipalities' => Municipality::where('status', 'Active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barangay_name'   => 'required|string|max:255',
            'purok'           => 'nullable|string|max:255',
            'municipality_id' => 'required|exists:municipalities,id',
            'status'          => 'required|in:Active,Inactive',
        ]);

        $municipality = Municipality::findOrFail($request->municipality_id);

        Barangay::create([
            'barangay_name'   => $validated['barangay_name'],
            'purok'           => $validated['purok'],
            'municipality_id' => $municipality->id,
            'municipality'    => $municipality->municipality,
            'region'          => $municipality->region,
            'province'        => $municipality->province,
            'zipcode'         => $municipality->zipcode,
            'status'          => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Barangay created successfully.');
    }

    public function update(Request $request, $id)
    {
        $barangay = Barangay::findOrFail($id);

        $validated = $request->validate([
            'barangay_name'   => 'required|string|max:255',
            'purok'           => 'nullable|string|max:255',
            'municipality_id' => 'required|exists:municipalities,id',
            'status'          => 'required|in:Active,Inactive',
        ]);

        $municipality = Municipality::findOrFail($request->municipality_id);

        $barangay->update([
            'barangay_name'   => $validated['barangay_name'],
            'purok'           => $validated['purok'],
            'municipality_id' => $municipality->id,
            'municipality'    => $municipality->municipality,
            'region'          => $municipality->region,
            'province'        => $municipality->province,
            'zipcode'         => $municipality->zipcode,
            'status'          => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Barangay updated successfully.');
    }

    public function destroy($id)
    {
        $barangay = Barangay::findOrFail($id);
        $barangay->delete();

        return redirect()->back()->with('success', 'Barangay deleted successfully.');
    }
}