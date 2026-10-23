<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
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
                        'email' => $request->user()->email,
                        'roles' => $request->user()->roles ?? null,
                        'status' => $request->user()->status ?? null,
                    ]
                    : null,
            ],
        ]);
    }
}
