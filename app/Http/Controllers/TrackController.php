<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TrackController extends Controller
{
    /**
     * Display a listing of track categories.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $categories = Track::query()
            ->when($search, function ($query, $search) {
                $query->where('category_name', 'like', "%{$search}%")
                      ->orWhere('category_code', 'like', "%{$search}%")
                      ->orWhere('track_type', 'like', "%{$search}%");
            })
            ->latest()
            ->get();

        return Inertia::render('Admin/Track', [
            'categories' => $categories,
            'filters'    => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created track category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_name'      => 'required|string|max:255',
            'category_code'      => 'required|string|max:100|unique:tracks,category_code',
            'track_type'         => 'required|string|in:MD,EF',
            'default_modalities' => 'nullable|string|max:500',
            'description'        => 'nullable|string',
            'status'             => 'required|string|in:Active,Inactive',
        ]);

        Track::create($validated);

        return redirect()->back()->with('success', 'Track category created successfully.');
    }

    /**
     * Update the specified track category.
     */
    public function update(Request $request, Track $track): RedirectResponse
    {
        $validated = $request->validate([
            'category_name'      => 'required|string|max:255',
            'category_code'      => 'required|string|max:100|unique:tracks,category_code,' . $track->id,
            'track_type'         => 'required|string|in:MD,EF',
            'default_modalities' => 'nullable|string|max:500',
            'description'        => 'nullable|string',
            'status'             => 'required|string|in:Active,Inactive',
        ]);

        $track->update($validated);

        return redirect()->back()->with('success', 'Track category updated successfully.');
    }

    /**
     * Remove the specified track category.
     */
    public function destroy(Track $track): RedirectResponse
    {
        $track->delete();

        return redirect()->back()->with('success', 'Track category deleted successfully.');
    }
}