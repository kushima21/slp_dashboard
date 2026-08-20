<?php

namespace App\Http\Controllers;

use App\Models\Municipality;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MunicipalityController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $municipalities = Municipality::query()
            ->when($search, function ($query, $search) {
                $query->where('municipality', 'like', "%{$search}%")
                      ->orWhere('province', 'like', "%{$search}%")
                      ->orWhere('region', 'like', "%{$search}%")
                      ->orWhere('zipcode', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => Municipality::count(),
            'active' => Municipality::where('status', 'Active')->count(),
            'inactive' => Municipality::where('status', 'Inactive')->count(),
        ];

        return Inertia::render('Admin/Municipality', [
            'municipalities' => $municipalities,
            'filters' => $request->only(['search']),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'municipality' => 'required|string|max:255',
            'region'       => 'required|string|max:255',
            'province'     => 'required|string|max:255',
            'zipcode'      => 'required|string|max:20',
            'status'       => 'nullable|in:Active,Inactive',
        ]);

        Municipality::create($validated);

        return redirect()->back()->with('success', 'Municipality created successfully.');
    }

    public function update(Request $request, Municipality $municipality)
    {
        $validated = $request->validate([
            'municipality' => 'required|string|max:255',
            'region'       => 'required|string|max:255',
            'province'     => 'required|string|max:255',
            'zipcode'      => 'required|string|max:20',
            'status'       => 'nullable|in:Active,Inactive',
        ]);

        $municipality->update($validated);

        return redirect()->back()->with('success', 'Municipality updated successfully.');
    }

    public function destroy(Municipality $municipality)
    {
        $municipality->delete();

        return redirect()->back()->with('success', 'Municipality deleted successfully.');
    }
}