<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnterpriseCategory extends Model
{
    use HasFactory;

    protected $table = 'enterprise_categories';

    protected $primaryKey = 'enterprise_category_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'category_name',
        'enterprise_type',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}