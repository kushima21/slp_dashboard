<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    use HasFactory;

    protected $table = 'municipalities';

    protected $primaryKey = 'municipality_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'municipality',
        'province',
        'region',
        'zipcode',
        'status',
    ];

    public function barangays()
    {
        return $this->hasMany(
            Barangay::class,
            'municipality_id',
            'municipality_id'
        );
    }
}