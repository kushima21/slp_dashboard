<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('individual', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | PRIMARY KEY
            |--------------------------------------------------------------------------
            */

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | PERSONAL INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('full_name')->nullable();

            $table->string('first_name')->nullable();

            $table->string('middle_name')->nullable();

            $table->string('last_name')->nullable();

            $table->string('suffix')->nullable();

            $table->enum('sex', [
                'Male',
                'Female',
            ]);

            $table->string(
                'contact_number',
                30
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | SLP TRACK
            |--------------------------------------------------------------------------
            |
            | MD = Micro-Enterprise Development
            | EF = Employment Facilitation
            |
            */

            $table->enum('track', [
                'MD',
                'EF',
            ]);

            /*
            |--------------------------------------------------------------------------
            | MODALITY
            |--------------------------------------------------------------------------
            |
            | MD:
            | SCF
            |
            | EF:
            | PEAH
            | ST
            | EAF
            |
            */

            $table->string(
                'modality',
                100
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | DISTRICT
            |--------------------------------------------------------------------------
            |
            | 1st District through 12th District
            |
            */

            $table->string(
                'district',
                100
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | LGU
            |--------------------------------------------------------------------------
            |
            | LGU 1 through LGU 12
            |
            */

            $table->string(
                'lgu',
                100
            )->default('LGU 1');

            /*
            |--------------------------------------------------------------------------
            | TYPE OF ENTERPRISE
            |--------------------------------------------------------------------------
            |
            | INDIVIDUAL
            |
            */

            $table->string(
                'type_of_enterprise',
                100
            )->default('INDIVIDUAL');

            /*
            |--------------------------------------------------------------------------
            | LOCATION
            |--------------------------------------------------------------------------
            |
            | municipality_id -> municipalities.municipality_id
            | barangay_id     -> barangays.barangay_id
            |
            */

            $table->unsignedBigInteger(
                'municipality_id'
            )->nullable();

            $table->unsignedBigInteger(
                'barangay_id'
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | IMPLEMENTATION
            |--------------------------------------------------------------------------
            */

            $table->unsignedSmallInteger(
                'implementation_year'
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | ASSESSMENT
            |--------------------------------------------------------------------------
            */

            $table->boolean(
                'validated'
            )->default(true);

            $table->text(
                'assessment_notes'
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | LIFECYCLE
            |--------------------------------------------------------------------------
            */

            $table->unsignedTinyInteger(
                'lifecycle_step'
            )->default(1);

            $table->string(
                'status_assessment'
            )->default('Pending');

            /*
            |--------------------------------------------------------------------------
            | FUND
            |--------------------------------------------------------------------------
            */

            $table->boolean(
                'fund_released'
            )->default(false);

            /*
            | Keep this DECIMAL because actual fund amounts
            | should remain numeric.
            |
            | EF + N/A is represented as NULL.
            |
            */

            $table->decimal(
                'fund_amount',
                12,
                2
            )->nullable();

            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index(
                'municipality_id',
                'individual_municipality_index'
            );

            $table->index(
                'barangay_id',
                'individual_barangay_index'
            );

            $table->index(
                'track',
                'individual_track_index'
            );

            $table->index(
                'modality',
                'individual_modality_index'
            );

            $table->index(
                'district',
                'individual_district_index'
            );

            $table->index(
                'lgu',
                'individual_lgu_index'
            );

            $table->index(
                'implementation_year',
                'individual_year_index'
            );

            $table->index(
                'status_assessment',
                'individual_status_index'
            );

            /*
            |--------------------------------------------------------------------------
            | FOREIGN KEY: MUNICIPALITY
            |--------------------------------------------------------------------------
            */

            $table->foreign(
                'municipality_id'
            )
                ->references('municipality_id')
                ->on('municipalities')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | FOREIGN KEY: BARANGAY
            |--------------------------------------------------------------------------
            */

            $table->foreign(
                'barangay_id'
            )
                ->references('barangay_id')
                ->on('barangays')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('individual');
    }
};