
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('association_monitoring_record', function (Blueprint $table) {
            $table->id();

            $table->string('association_id')->index();
            $table->string('name_of_project')->nullable();

            $table->unsignedBigInteger('municipality_id')->nullable()->index();
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->string('zipcode', 20)->nullable();
            $table->unsignedBigInteger('barangay_id')->nullable()->index();

            $table->string('district')->nullable();
            $table->string('lgu')->nullable();
            $table->string('enterprise_type')->nullable();
            $table->unsignedSmallInteger('year_implemented')->nullable();

            $table->decimal('fund_amount', 15, 2)->default(0);
            $table->string('status_assessment')->nullable();
            $table->string('track')->nullable();
            $table->string('modality')->nullable();
            $table->string('type_of_enterprise')->nullable();

            $table->unsignedSmallInteger('evaluation_year')->index();
            $table->date('date_provided')->nullable();

            $table->decimal('quarter_gross_sales', 15, 2)->default(0);
            $table->decimal('quarter_cost_of_sales', 15, 2)->default(0);
            $table->decimal('quarter_gross_profit', 15, 2)->default(0);
            $table->decimal('operating_expenses', 15, 2)->default(0);
            $table->decimal('total_quarterly_net_income', 15, 2)->default(0);

            $table->decimal('cash_in_bank', 15, 2)->default(0);
            $table->decimal('cash_on_hand', 15, 2)->default(0);
            $table->decimal('total_saving', 15, 2)->default(0);

            $table->string('enterprises_status')->nullable();
            $table->text('intervention_support')->nullable();
            $table->text('evaluation_recommendation')->nullable();
            $table->text('remarks')->nullable();

            $table->string('additional_assessment_fund')->nullable();
            $table->decimal('additional_fund_amount', 15, 2)->nullable();
            $table->text('additional_fund_details')->nullable();

            $table->timestamps();

            $table->unique(
                ['association_id', 'evaluation_year'],
                'association_monitoring_association_year_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('association_monitoring_record');
    }
};
