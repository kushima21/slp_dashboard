<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Display the login page.
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('Welcome', [
            'phpVersion' => PHP_VERSION,
        ]);
    }

    /**
     * Authenticate the user and redirect to Admin/Dashboard.jsx.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Allow only active accounts.
        $credentials['status'] = 'Active';

        if (!Auth::attempt(
            $credentials,
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'email' => 'Invalid email or password, or your account is not active.',
            ]);
        }

        // Regenerate the session after successful login.
        $request->session()->regenerate();

        // Redirect directly to the Admin Dashboard.
        return redirect()->route('dashboard');
    }

    /**
     * Log out the authenticated user.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}