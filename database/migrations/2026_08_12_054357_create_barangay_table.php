<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangays', function (Blueprint $table) {
            $table->id('barangay_id');
            $table->string('barangay_name');
            $table->string('purok')->nullable();
            $table->foreignId('municipality_id')->constrained('municipalities', 'id')->onDelete('cascade');
            $table->string('municipality');
            $table->string('region');
            $table->string('province');
            $table->string('zipcode')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barangays');
    }
};