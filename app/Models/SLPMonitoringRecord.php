<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SLPMonitoringRecord extends Model
{
    use HasFactory;

    protected $table = 's_l_p_monitoring_records';

    protected $primaryKey = 'monitoring_record_id';

    protected $fillable = [
        'beneficiaries_id',
        'mpdos',
        'evaluation_year',
        'date_provided',
        'track',
        'modality',
        'district',
        'lgu',
        'municipality',
        'barangay',
        'total_grant_received',
        'name_of_project',
        'type_of_enterprise',
        'name_of_slpa_slp_participant',
        'enterprises_status',
        'intervention_support',
        'evaluation_recommendation',
        'remarks',

        // Evaluation financial fields
        'quarter_gross_sales',
        'quarter_cost_of_sales',
        'quarter_gross_profit',
        'operating_expenses',
        'total_quarterly_net_income',
        'cash_in_bank',
        'cash_on_hand',
        'total_saving',
        'additional_assessment_fund',
        'additional_fund_amount',
    ];

    protected $casts = [
        'monitoring_record_id' => 'integer',
        'beneficiaries_id' => 'integer',
        'evaluation_year' => 'integer',
        'date_provided' => 'date',
        'total_grant_received' => 'decimal:2',

        'quarter_gross_sales' => 'decimal:2',
        'quarter_cost_of_sales' => 'decimal:2',
        'quarter_gross_profit' => 'decimal:2',
        'operating_expenses' => 'decimal:2',
        'total_quarterly_net_income' => 'decimal:2',
        'cash_in_bank' => 'decimal:2',
        'cash_on_hand' => 'decimal:2',
        'total_saving' => 'decimal:2',
        'additional_fund_amount' => 'decimal:2',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(
            SLPBeneficiaries::class,
            'beneficiaries_id',
            'beneficiaries_id'
        );
    }
}