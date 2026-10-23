<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('md_participants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('individual_id')
                ->constrained('individual')
                ->cascadeOnDelete();

            $table->string('enterprise_name');
            $table->string('enterprise_type')->nullable();
            $table->text('business_location')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('md_participants');
    }
};