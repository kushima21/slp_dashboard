<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Individual extends Model
{
    use HasFactory;

    protected $table = 'individual';

    protected $fillable = [
        'full_name',
        'sex',
        'track',
        'contact_number',
        'municipality',
        'barangay',
        'address',
        'validated',
        'assessment_notes',
        'lifecycle_step',
        'status_assessment',
        'fund_released',
        'fund_amount',
        'enterprise',
        'employment',
    ];


}