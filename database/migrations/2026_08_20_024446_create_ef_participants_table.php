<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ef_participants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('individual_id')
                ->constrained('individual')
                ->cascadeOnDelete();

            $table->string('target_job');
            $table->text('skills_training')->nullable();
            $table->string('preferred_employer')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ef_participants');
    }
};