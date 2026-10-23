<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('s_l_p_monitoring_records', function (Blueprint $table) {
            $table->id('monitoring_record_id');

            // Link to the beneficiary
            $table->unsignedBigInteger('beneficiaries_id')->index();

            // Evaluation and administrative information
            $table->string('mpdos')->nullable();
            $table->year('evaluation_year')->nullable();
            $table->date('date_provided')->nullable();

            // SLP classification and location
            $table->string('track')->nullable();
            $table->string('modality')->nullable();
            $table->string('district')->nullable();
            $table->string('lgu')->nullable();
            $table->string('municipality')->nullable();
            $table->string('barangay')->nullable();

            // Beneficiary and enterprise information
            $table->decimal('total_grant_received', 15, 2)->default(0);
            $table->string('name_of_project')->nullable();
            $table->string('type_of_enterprise')->nullable();
            $table->string('name_of_slpa_slp_participant')->nullable();
            $table->string('enterprises_status')->nullable();

            // Evaluation results
            $table->text('intervention_support')->nullable();
            $table->text('evaluation_recommendation')->nullable();
            $table->text('remarks')->nullable();


            $table->timestamps();

            // One monitoring record per beneficiary.
            $table->unique('beneficiaries_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('s_l_p_monitoring_records');
    }
};