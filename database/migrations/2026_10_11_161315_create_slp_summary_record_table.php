
    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up(): void
        {
            Schema::create('slp_summary_record', function (Blueprint $table) {
                $table->slp_summary_id();

                $table->string('mpdos')->nullable();
                $table->unsignedSmallInteger('evaluation_year')->index();
                $table->date('date_provided')->nullable();

                $table->string('track')->nullable();
                $table->string('modality')->nullable();
                $table->string('district')->nullable();
                $table->string('lgu')->nullable();
                $table->string('municipality')->nullable();
                $table->string('barangay')->nullable();

                $table->decimal('total_grant_received', 15, 2)->default(0);

                $table->string('association_id')->nullable()->index();
                $table->string('name_of_project')->nullable();
                $table->string('type_of_enterprise')->nullable();
                $table->string('name_of_slp_participant')->nullable();

                $table->string('enterprises_status')->nullable();
                $table->text('intervention_support')->nullable();
                $table->text('evaluation_recommendation')->nullable();
                $table->text('remarks')->nullable();
                $table->decimal('additional_assessment_fund', 15, 2)
                    ->nullable();

                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('slp_summary_record');
        }
    };
