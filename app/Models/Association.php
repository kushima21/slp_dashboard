<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Association extends Model
{
    use HasFactory;

    protected $table = 'associations';

    protected $fillable = [
        'association_id',
        'enterprise',
        'type_of_enterprise',
        'representative',
        'location',
        'project_location',
        'lifecycle_step',
        'status_assessment',
    ];

    protected $casts = [
        'representative' => 'array',
        'location' => 'array',
        'project_location' => 'array',
        'lifecycle_step' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Append virtual attributes to maintain camelCase compatibility with React state
    protected $appends = ['lifecycleStep', 'statusAssessment'];

    public function getLifecycleStepAttribute(): int
    {
        return $this->attributes['lifecycle_step'] ?? 1;
    }

    public function getStatusAssessmentAttribute(): string
    {
        return $this->attributes['status_assessment'] ?? 'Pending';
    }
}