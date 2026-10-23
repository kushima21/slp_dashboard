<?php

use App\Models\Users;

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => Users::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Resetting
    |--------------------------------------------------------------------------
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env(
                'AUTH_PASSWORD_RESET_TOKEN_TABLE',
                'password_reset_tokens'
            ),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

    'auth' => [
    'user' => fn () => $request->user()
        ? [
            'id' => $request->user()->getAuthIdentifier(),
            'name' => $request->user()->name
                ?? trim(
                    ($request->user()->firstname ?? '') . ' ' .
                    ($request->user()->middlename ?? '') . ' ' .
                    ($request->user()->lastname ?? '')
                ),
            'firstname' => $request->user()->firstname ?? null,
            'middlename' => $request->user()->middlename ?? null,
            'lastname' => $request->user()->lastname ?? null,
            'email' => $request->user()->email,
            'roles' => $request->user()->roles ?? null,
            'status' => $request->user()->status ?? null,
        ]
        : null,
],

];


