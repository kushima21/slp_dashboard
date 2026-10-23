<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $table = 'barangays';

    protected $primaryKey = 'barangay_id';

    public $incrementing = true;

    protected $keyType = 'int';

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

    protected $casts = [
        'barangay_id' => 'integer',
        'municipality_id' => 'integer',
    ];

    /**
     * Barangay belongs to Municipality.
     */
    public function municipalityRelation()
    {
        return $this->belongsTo(
            Municipality::class,
            'municipality_id',
            'municipality_id'
        );
    }
}

