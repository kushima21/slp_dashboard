<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\MunicipalityController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\EnterpriseCategoryController;
use App\Http\Controllers\SLPBeneficiariesController;
use App\Http\Controllers\SLPMonitoringController;
use App\Http\Controllers\SLPMemberController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Display login page
Route::get('/', [LoginController::class, 'showLoginForm'])
    ->name('login');

// Process login form
Route::post('/login', [LoginController::class, 'login'])
    ->name('login.authenticate');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
|
| All application pages below require a successful login.
|
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard and Summary
    |--------------------------------------------------------------------------
    */

  Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');
    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
Route::get('/summary', [SummaryController::class, 'index'])
    ->name('slp.summary.index');

Route::get('/summary/export-excel', [SummaryController::class, 'exportExcel'])
    ->name('slp.summary.export-excel');

Route::get('/summary/print-data', [SummaryController::class, 'printData'])
    ->name('slp.summary.print-data');

// Keep this route if it already exists in your application.
Route::post('/slp-monitoring/bulk-evaluation', [
    SLPMonitoringController::class,
    'bulkEvaluation',
])->name('slp-monitoring.bulk-evaluation');

// Keep this route if it already exists in your application.
Route::get('/slp-monitoring/{beneficiaries_id}/graph', [
    SLPMonitoringController::class,
    'graph',
])->name('slp-monitoring.graph');

    Route::post('/logout', [LoginController::class, 'logout'])
        ->name('logout');


    /*
    |--------------------------------------------------------------------------
    | Municipality Management
    |--------------------------------------------------------------------------
    */

    Route::get('/municipality', [MunicipalityController::class, 'index'])
        ->name('municipality.index');

    Route::post('/municipality', [MunicipalityController::class, 'store'])
        ->name('municipality.store');

    Route::put('/municipality/{municipality}', [MunicipalityController::class, 'update'])
        ->name('municipality.update');

    Route::delete('/municipality/{municipality}', [MunicipalityController::class, 'destroy'])
        ->name('municipality.destroy');


    /*
    |--------------------------------------------------------------------------
    | Barangay Management
    |--------------------------------------------------------------------------
    */

    Route::controller(BarangayController::class)->group(function () {
        Route::get('/barangay', 'index')
            ->name('barangay.index');

        Route::post('/barangay', 'store')
            ->name('barangay.store');

        Route::put('/barangay/{id}', 'update')
            ->name('barangay.update');

        Route::delete('/barangay/{id}', 'destroy')
            ->name('barangay.destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | SLP Track Management
    |--------------------------------------------------------------------------
    */

    Route::get('/track', [TrackController::class, 'index'])
        ->name('track.index');

    Route::post('/slp/track-categories', [TrackController::class, 'store'])
        ->name('track-categories.store');

    Route::put('/slp/track-categories/{track}', [TrackController::class, 'update'])
        ->name('track-categories.update');

    Route::delete('/slp/track-categories/{track}', [TrackController::class, 'destroy'])
        ->name('track-categories.destroy');








    /*
    |--------------------------------------------------------------------------
    | Enterprise Category Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/enterprisecategory',
        [EnterpriseCategoryController::class, 'index']
    )->name('enterprise-category.index');

    Route::post(
        '/enterprisecategory',
        [EnterpriseCategoryController::class, 'store']
    )->name('enterprise-category.store');

    Route::put(
        '/enterprisecategory/{enterpriseCategory}',
        [EnterpriseCategoryController::class, 'update']
    )->name('enterprise-category.update');

    Route::delete(
        '/enterprisecategory/{enterpriseCategory}',
        [EnterpriseCategoryController::class, 'destroy']
    )->name('enterprise-category.destroy');



    /*
    |--------------------------------------------------------------------------
    | User Management
    |--------------------------------------------------------------------------
    */
    Route::get('/users', [UsersController::class, 'index'])
        ->name('users.index');

    Route::post('/users', [UsersController::class, 'store'])
        ->name('users.store');

    Route::put('/users/{user}', [UsersController::class, 'update'])
        ->name('users.update');

    Route::delete('/users/{user}', [UsersController::class, 'destroy'])
        ->name('users.destroy');



});
Route::get('/slp-beneficiaries', [
    SLPBeneficiariesController::class,
    'index',
])->name('slp-beneficiaries.index');

Route::post('/slp-beneficiaries', [
    SLPBeneficiariesController::class,
    'store',
])->name('slp-beneficiaries.store');

Route::put('/slp-beneficiaries/{id}', [
    SLPBeneficiariesController::class,
    'update',
])->name('slp-beneficiaries.update');

Route::delete('/slp-beneficiaries/{id}', [
    SLPBeneficiariesController::class,
    'destroy',
])->name('slp-beneficiaries.destroy');

Route::post(
    '/slp-beneficiaries/bulk-import',
    [SLPBeneficiariesController::class, 'bulkImport']
)->name('slp-beneficiaries.bulk-import');


Route::get('/slp-monitoring', [
    SLPMonitoringController::class,
    'index',
])->name('slp-monitoring.index');

Route::post('/slp-monitoring/bulk-evaluation', [
    SLPMonitoringController::class,
    'bulkEvaluation',
])->name('slp-monitoring.bulk-evaluation');

Route::get('/slp-monitoring/{beneficiaries_id}/graph', [
    SLPMonitoringController::class,
    'graph',
])->name('slp-monitoring.graph');

Route::post('/slp-monitoring/{beneficiaries_id}/evaluation', [
    SLPMonitoringController::class,
    'storeEvaluation',
])->name('slp-monitoring.evaluation.store');

Route::get('/slp-monitoring/{beneficiaries_id}/monitoring', [
    SLPMonitoringController::class,
    'graph',
])->name('slp-monitoring.graph');

Route::middleware(['auth'])->group(function () {
    Route::post(
        '/slp-monitoring/{beneficiaries_id}/evaluation',
        [SLPMonitoringController::class, 'storeEvaluation']
    )->name('slp-monitoring.evaluation.store');
});

Route::get(
    '/slp-beneficiaries/{beneficiaries_id}/manage',
    [SLPBeneficiariesController::class, 'manage']
)->name('slp-beneficiaries.manage');

Route::post('/slp-members', [
    SLPMemberController::class,
    'store',
])->name('slp-members.store');


Route::get('/analytics', [AnalyticsController::class, 'index'])
    ->name('analytics.index');