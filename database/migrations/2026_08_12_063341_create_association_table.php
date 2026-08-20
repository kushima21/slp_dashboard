<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associations', function (Blueprint $table) {
            $table->id();
            $table->string('association_id')->unique();
            $table->string('enterprise');
            $table->string('type_of_enterprise')->default('association enterprise');
            
            // Storing nested object payloads as JSON columns
            $table->json('representative')->nullable();
            $table->json('location')->nullable();
            $table->json('project_location')->nullable();
            
            $table->integer('lifecycle_step')->default(1);
            $table->string('status_assessment')->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associations');
    }
};