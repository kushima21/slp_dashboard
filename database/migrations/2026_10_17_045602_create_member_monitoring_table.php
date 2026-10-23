
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_monitoring', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('beneficiaries_id')->index();

            // Matches IDs such as SLM-2026-79055503.
            $table->string('member_id', 100);

            $table->year('evaluation_year');
            $table->date('date_provided')->nullable();

            $table->string('status', 20);
            $table->string('mpdos')->nullable();
            $table->string('enterprises_status')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();

            // One evaluation record per member per year.
            $table->unique(
                ['beneficiaries_id', 'member_id', 'evaluation_year'],
                'member_monitoring_beneficiary_member_year_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_monitoring');
    }
};
