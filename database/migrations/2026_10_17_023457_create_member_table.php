
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member', function (Blueprint $table) {
            $table->id();

            // Member identification
            $table->string('member_id')->unique();
            $table->string('member_name');

            // Linked SLP beneficiary
            $table->unsignedBigInteger('beneficiaries_id')->index();
            $table->string('participant_name')->nullable();

            // Personal information
            $table->string('gender', 20);
            $table->date('birthdate');
            $table->unsignedSmallInteger('year_joined');

            // Association position and contact
            $table->string('role', 100);
            $table->string('contact_number', 30);

            // Residential address
            $table->string('municipality', 150);
            $table->string('barangay', 150);
            $table->string('purok', 150);

            // Member status
            $table->string('status', 20)->default('Active');

            $table->timestamps();

            // Additional indexes
            $table->index('member_name');
            $table->index('role');
            $table->index('status');
            $table->index(['beneficiaries_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member');
    }
};
