<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasFactory;

    protected $table = 'tracks';

    protected $fillable = [
        'category_name',
        'category_code',
        'track_type',
        'default_modalities',
        'description',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function individuals()
    {
        return $this->hasMany(
            Individual::class,
            'track_id',
            'id'
        );
    }
}