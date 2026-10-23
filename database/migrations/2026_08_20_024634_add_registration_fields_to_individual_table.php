<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associations', function (Blueprint $table) {

            // Add enterprise_category_id first
            if (!Schema::hasColumn('associations', 'enterprise_category_id')) {
                $table->unsignedBigInteger('enterprise_category_id')
                    ->nullable()
                    ->after('barangay');
            }

            // Then add enterprise_type
            if (!Schema::hasColumn('associations', 'enterprise_type')) {
                $table->string('enterprise_type')
                    ->nullable()
                    ->after('enterprise_category_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('associations', function (Blueprint $table) {

            if (Schema::hasColumn('associations', 'enterprise_type')) {
                $table->dropColumn('enterprise_type');
            }

            if (Schema::hasColumn('associations', 'enterprise_category_id')) {
                $table->dropColumn('enterprise_category_id');
            }
        });
    }
};