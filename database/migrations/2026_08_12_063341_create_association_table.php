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
        Schema::create('associations', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | PRIMARY ASSOCIATION INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('association_id')->primary();

            $table->string('association_name');

            /*
            |--------------------------------------------------------------------------
            | SLP INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('track')
                ->default('MD');

            $table->string('modality')
                ->default('SCF');

            $table->string('district')
                ->default('1st District');

            $table->string('lgu')
                ->default('LGU 1');

            $table->string('type_of_enterprise')
                ->default('ASSOCIATION');

            /*
            |--------------------------------------------------------------------------
            | LOCATION
            |--------------------------------------------------------------------------
            */

            $table->unsignedBigInteger('municipality_id');

            $table->string('municipality');

            $table->unsignedBigInteger('barangay_id');

            $table->string('barangay');

            $table->string('province')->nullable();

            $table->string('region')->nullable();

            $table->string('zipcode')->nullable();

            /*
            |--------------------------------------------------------------------------
            | ENTERPRISE INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->unsignedBigInteger('enterprise_category_id')
                ->nullable();

            $table->string('enterprise_type')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | PROJECT / FUNDING INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->year('year_implemented')
                ->nullable();

            $table->decimal('fund_amount', 15, 2)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | LIFECYCLE
            |--------------------------------------------------------------------------
            */

            $table->unsignedTinyInteger('lifecycle_step')
                ->default(1);

            /*
            |--------------------------------------------------------------------------
            | STATUS ASSESSMENT
            |--------------------------------------------------------------------------
            */

            $table->string('status_assessment')
                ->nullable();

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

            $table->index('year_implemented');

            $table->index('status_assessment');

            $table->index('lifecycle_step');

            $table->index('enterprise_category_id');

            $table->index('enterprise_type');

            $table->index('track');

            $table->index('modality');

            $table->index('district');

            $table->index('lgu');

            $table->index('type_of_enterprise');

            $table->index('municipality_id');

            $table->index('barangay_id');

            $table->index('province');

            $table->index('region');

            $table->index('zipcode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('associations');
    }
};