<?php

namespace App\Http\Controllers;

use App\Models\Association;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AssociationController extends Controller
{
    /**
     * Display the Association Directory page.
     */
    public function index(Request $request): Response
    {
        $query = Association::query();

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('enterprise', 'like', "%{$search}%")
                  ->orWhere('association_id', 'like', "%{$search}%")
                  ->orWhere('representative->firstname', 'like', "%{$search}%")
                  ->orWhere('representative->lastname', 'like', "%{$search}%")
                  ->orWhere('location->municipality', 'like', "%{$search}%")
                  ->orWhere('location->barangay', 'like', "%{$search}%");
            });
        }

        // LGU / Municipality Filter
        if ($lgu = $request->input('lgu')) {
            if ($lgu !== 'All') {
                $query->where('location->municipality', $lgu);
            }
        }

        $associations = $query->latest()->get();

        return Inertia::render('Admin/Association', [
            'associations' => $associations,
            'filters' => $request->only(['search', 'lgu']),
        ]);
    }

    /**
     * Store a newly created association profile.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'association_id' => 'required|string|unique:associations,association_id',
            'enterprise' => 'required|string|max:255',
            'type_of_enterprise' => 'nullable|string|max:255',
            
            // Representative payload validation
            'representative' => 'required|array',
            'representative.firstname' => 'required|string|max:255',
            'representative.middlename' => 'nullable|string|max:255',
            'representative.lastname' => 'required|string|max:255',
            'representative.gender' => 'required|string|in:Male,Female',
            'representative.suffix' => 'nullable|string|max:50',
            'representative.types_of_participant' => 'required|string',
            'representative.type_of_eligibility' => 'required|string',

            // Location payload validation
            'location' => 'required|array',
            'location.municipality_id' => 'nullable|string',
            'location.municipality' => 'required|string',
            'location.barangay' => 'required|string',
            'location.province' => 'nullable|string',
            'location.region' => 'nullable|string',
            'location.zipcode' => 'nullable|string',

            // Project location payload validation
            'project_location' => 'required|array',
            'project_location.location_of_project' => 'required|string',
            'project_location.street' => 'nullable|string',
            'project_location.barangay' => 'nullable|string',
            'project_location.municipality' => 'nullable|string',
            'project_location.province' => 'nullable|string',
            'project_location.region' => 'nullable|string',
            'project_location.zipcode' => 'nullable|string',
        ]);

        Association::create([
            'association_id' => $validated['association_id'],
            'enterprise' => $validated['enterprise'],
            'type_of_enterprise' => $validated['type_of_enterprise'] ?? 'association enterprise',
            'representative' => $validated['representative'],
            'location' => $validated['location'],
            'project_location' => $validated['project_location'],
            'lifecycle_step' => 1,
            'status_assessment' => 'Pending',
        ]);

        return redirect()->back()->with('success', 'Association registered successfully.');
    }

    /**
     * Update an existing association profile.
     */
    public function update(Request $request, Association $association): RedirectResponse
    {
        $validated = $request->validate([
            'association_id' => 'required|string|unique:associations,association_id,' . $association->id,
            'enterprise' => 'required|string|max:255',
            'type_of_enterprise' => 'nullable|string|max:255',
            'representative' => 'required|array',
            'representative.firstname' => 'required|string|max:255',
            'representative.lastname' => 'required|string|max:255',
            'location' => 'required|array',
            'location.municipality' => 'required|string',
            'location.barangay' => 'required|string',
            'project_location' => 'required|array',
            'project_location.location_of_project' => 'required|string',
        ]);

        $association->update([
            'association_id' => $validated['association_id'],
            'enterprise' => $validated['enterprise'],
            'type_of_enterprise' => $request->input('type_of_enterprise', $association->type_of_enterprise),
            'representative' => $request->input('representative'),
            'location' => $request->input('location'),
            'project_location' => $request->input('project_location'),
        ]);

        return redirect()->back()->with('success', 'Association updated successfully.');
    }

    /**
     * Remove the specified association.
     */
    public function destroy(Association $association): RedirectResponse
    {
        $association->delete();

        return redirect()->back()->with('success', 'Association deleted successfully.');
    }
}