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
        Schema::create('enterprise_categories', function (Blueprint $table) {

            $table->bigIncrements('enterprise_category_id');

            $table->string('category_name');

            $table->string('enterprise_type');

            $table->text('description')->nullable();

            // Default status
            $table->string('status')
                ->default('Active');

            $table->timestamps();

            // Prevent duplicate enterprise types
            $table->unique(
                ['category_name', 'enterprise_type'],
                'enterprise_category_type_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enterprise_categories');
    }
};