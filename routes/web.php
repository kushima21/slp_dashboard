<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MunicipalityController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\AssociationController;
use App\Http\Controllers\IndividualController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
});


Route::get('/municipality', [MunicipalityController::class, 'index'])->name('municipality.index');
Route::post('/municipality', [MunicipalityController::class, 'store'])->name('municipality.store');
Route::put('/municipality/{municipality}', [MunicipalityController::class, 'update'])->name('municipality.update');
Route::delete('/municipality/{municipality}', [MunicipalityController::class, 'destroy'])->name('municipality.destroy');

Route::controller(BarangayController::class)->group(function () {
    Route::get('/barangay', 'index')->name('barangay.index');
    Route::post('/barangay', 'store')->name('barangay.store');
    Route::put('/barangay/{id}', 'update')->name('barangay.update');
    Route::delete('/barangay/{id}', 'destroy')->name('barangay.destroy');
});

Route::get('/dashboard', function () {
    return Inertia::render('Admin/Dashboard');
});

Route::get('/summary', function () {
    return Inertia::render('Admin/Summary');
});

    // List & render page
    Route::get('/track', [TrackController::class, 'index'])->name('track.index');
    
    // CRUD endpoints (matched to the Inertia component)
    Route::post('/slp/track-categories', [TrackController::class, 'store'])->name('track-categories.store');
    Route::put('/slp/track-categories/{track}', [TrackController::class, 'update'])->name('track-categories.update');
    Route::delete('/slp/track-categories/{track}', [TrackController::class, 'destroy'])->name('track-categories.destroy');



    // Associations Management
    Route::get('/association', [AssociationController::class, 'index'])->name('association.index');
    Route::post('/association', [AssociationController::class, 'store'])->name('association.store');
    Route::put('/association/{association}', [AssociationController::class, 'update'])->name('association.update');
    Route::delete('/association/{association}', [AssociationController::class, 'destroy'])->name('association.destroy');


Route::get('/individual', [IndividualController::class, 'index'])
    ->name('individual.index');


require __DIR__.'/auth.php';
