<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SLPBeneficiaries extends Model
{
    use HasFactory;

    protected $table = 'slp_beneficiaries';

    protected $primaryKey = 'beneficiaries_id';

    protected $fillable = [
        'year_implemented',
        'track',
        'modality',
        'district',
        'lgu',
        'city_municipality',
        'barangay',
        'total_grant_received',
        'name_of_project',
        'type_of_enterprise',
        'name_of_slpa_slp_participant',
        'enterprise_status',
    ];

    protected $casts = [
        'beneficiaries_id' => 'integer',
        'year_implemented' => 'integer',
        'total_grant_received' => 'decimal:2',
    ];

    public function monitoringRecord()
{
    return $this->hasOne(
        SLPMonitoringRecord::class,
        'beneficiaries_id',
        'beneficiaries_id'
    );
}
}