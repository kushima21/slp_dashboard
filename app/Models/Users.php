<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Users extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'contact_number',
        'gender',
        'address',
        'email',
        'password',
        'lgu',
        'municipality',
        'district',
        'roles',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'roles' => 'array',
            'password' => 'hashed',
        ];
    }

    public function getNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->firstname,
            $this->middlename,
            $this->lastname,
        ])));
    }
}
