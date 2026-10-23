<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberMonitoring extends Model
{
    use HasFactory;

    protected $table = 'member_monitoring';

    protected $fillable = [
        'beneficiaries_id',
        'member_id',
        'evaluation_year',
        'date_provided',
        'status',
        'mpdos',
        'enterprises_status',
        'remarks',
    ];

    protected $casts = [
        'beneficiaries_id' => 'integer',
        'evaluation_year' => 'integer',
        'date_provided' => 'date',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(
            SLPBeneficiaries::class,
            'beneficiaries_id',
            'beneficiaries_id'
        );
    }

    public function member()
    {
        return $this->belongsTo(
            Member::class,
            'member_id',
            'member_id'
        );
    }
}
