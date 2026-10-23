<?php

namespace App\Http\Controllers;

use App\Models\EnterpriseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnterpriseCategoryController extends Controller
{
    /**
     * Display the enterprise categories.
     */
    public function index()
    {
        $categories = EnterpriseCategory::orderBy('category_name')
            ->orderBy('enterprise_type')
            ->get();

        return Inertia::render('Admin/EnterpriseCategory', [
            'categories' => $categories,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a new enterprise category.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'category_name' => [
            'required',
            'string',
            'max:255',
        ],

        'enterprise_type' => [
            'required',
            'string',
            'max:255',
        ],

        'description' => [
            'nullable',
            'string',
        ],
    ]);

    // Default status
    $validated['status'] = 'Active';

    EnterpriseCategory::create($validated);

    return redirect()
        ->route('enterprise-category.index')
        ->with(
            'success',
            'Enterprise category successfully added.'
        );
}

    /**
     * Update an existing enterprise category.
     */
    public function update(
        Request $request,
        EnterpriseCategory $enterpriseCategory
    ) {
        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:255',
            ],

            'enterprise_type' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $enterpriseCategory->update($validated);

        return redirect()
            ->route('enterprise-category.index')
            ->with(
                'success',
                'Enterprise category successfully updated.'
            );
    }

    /**
     * Delete an enterprise category.
     */
    public function destroy(
        EnterpriseCategory $enterpriseCategory
    ) {
        $enterpriseCategory->delete();

        return redirect()
            ->route('enterprise-category.index')
            ->with(
                'success',
                'Enterprise category successfully deleted.'
            );
    }
}