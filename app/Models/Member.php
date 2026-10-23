<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    // Your migration creates "member", not "members".
    protected $table = 'member';

    protected $fillable = [
        'member_id',
        'member_name',
        'beneficiaries_id',
        'participant_name',
        'gender',
        'birthdate',
        'year_joined',
        'role',
        'contact_number',
        'municipality',
        'barangay',
        'purok',
        'status',
    ];

    protected $casts = [
        'beneficiaries_id' => 'integer',
        'birthdate' => 'date',
        'year_joined' => 'integer',
    ];
}
