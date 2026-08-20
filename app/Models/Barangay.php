<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $primaryKey = 'barangay_id';

    protected $fillable = [
        'barangay_name',
        'purok',
        'municipality_id',
        'municipality',
        'region',
        'province',
        'zipcode',
        'status',
    ];

    public function municipalityRelation()
    {
        return $this->belongsTo(Municipality::class, 'municipality_id');
    }
}