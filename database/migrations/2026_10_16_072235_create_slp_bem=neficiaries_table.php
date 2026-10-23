
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slp_beneficiaries', function (Blueprint $table) {
            $table->id('beneficiaries_id');

            // Implementation details
            $table->unsignedSmallInteger('year_implemented')->index();

            // Track: MD or EF
            $table->string('track', 50)->index();

            // Modality: SFC, PEAF, or ST
            $table->string('modality', 100)->index();

            // District: 1st District through 12th District
            $table->string('district', 100)->index();

            // Location details
            $table->string('lgu', 150)->index();
            $table->string('city_municipality', 150);
            $table->string('barangay', 150);

            // Grant and project details
            $table->decimal('total_grant_received', 15, 2)->default(0);
            $table->string('name_of_project', 255);

            // Enterprise type: ASSOCIATION or INDIVIDUAL
            $table->string('type_of_enterprise', 150)->nullable()->index();

            // Beneficiary information
            $table->string('name_of_slpa_slp_participant', 255);

            // Enterprise status
            $table->enum('enterprise_status', [
                'For Mainstreaming',
                'For Rehabilitation',
                'For Closure',
            ])->default('For Mainstreaming')->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slp_beneficiaries');
    }
};
