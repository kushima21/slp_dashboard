<?php

namespace App\Http\Controllers;

use App\Models\Municipality;
use App\Models\Barangay;
use App\Models\Individual;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndividualController extends Controller
{
    public function index()
    {
        // ================================
        // MUNICIPALITIES
        // ================================
        $municipalities = Municipality::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->orderBy('municipality')
            ->get([
                'id',
                'municipality',
                'region',
                'province',
                'zipcode',
            ]);

        // ================================
        // BARANGAYS
        // ================================
        $barangays = Barangay::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->orderBy('barangay_name')
            ->get([
                'barangay_id',
                'barangay_name',
                'municipality_id',
                'municipality',
                'region',
                'province',
                'zipcode',
            ]);

        // ================================
        // INDIVIDUAL PARTICIPANTS
        // ================================
        $individual = Individual::all();

        return Inertia::render('Admin/Individual', [
            'individual' => $individual,
            'associations' => [],
            'enterprises' => [],
            'municipalities' => $municipalities,
            'barangays' => $barangays,
        ]);
    }
}