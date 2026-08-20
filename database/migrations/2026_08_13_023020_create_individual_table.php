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
            $table->id();
            $table->string('full_name');
            $table->enum('sex', ['Male', 'Female']);
            $table->enum('track', ['MD', 'EF']);
            $table->string('contact_number')->nullable();
            $table->string('municipality');
            $table->string('barangay');
            $table->text('address')->nullable();
            
            // Assessment & Lifecycle
            $table->boolean('validated')->default(true);
            $table->text('assessment_notes')->nullable();
            $table->unsignedTinyInteger('lifecycle_step')->default(3); // Default step: Track Planning
            $table->string('status_assessment')->default('Pending');
            
            // Financial Assistance
            $table->boolean('fund_released')->default(false);
            $table->decimal('fund_amount', 12, 2)->default(0.00);
            
            // Dynamic Track Payloads (JSON storage for MD/EF specific fields)
            $table->json('enterprise')->nullable();  // { name, type, businessLocation }
            $table->json('employment')->nullable();  // { targetJob, skillsTraining, preferredEmployer }
            
            $table->timestamps();
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