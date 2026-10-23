<?php

namespace App\Http\Controllers;

use App\Models\Users;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    /**
     * Display the user management page.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $users = Users::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('firstname', 'like', "%{$search}%")
                        ->orWhere('middlename', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhere('lgu', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->get();

        $municipalities = DB::table('municipalities')
            ->select('municipality_id', 'municipality')
            ->orderBy('municipality')
            ->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
            'municipalities' => $municipalities,
            'lguOptions' => $municipalities
                ->pluck('municipality')
                ->filter()
                ->unique()
                ->values(),
            'districts' => collect(range(1, 12))
                ->map(function ($number) {
                    $suffix = match ($number) {
                        1 => 'st',
                        2 => 'nd',
                        3 => 'rd',
                        default => 'th',
                    };

                    return "{$number}{$suffix} District";
                })
                ->values(),
        ]);
    }

    /**
     * Register a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:100'],
            'middlename' => ['nullable', 'string', 'max:100'],
            'lastname' => ['required', 'string', 'max:100'],
            'contact_number' => ['required', 'string', 'max:30'],
            'gender' => ['required', Rule::in([
                'Male',
                'Female',
                'Other',
            ])],
            'address' => ['required', 'string', 'max:2000'],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'lgu' => ['required', 'string', 'max:150'],
            'municipality' => ['required', 'string', 'max:150'],
            'district' => [
                'required',
                Rule::in($this->districtOptions()),
            ],

            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'required',
                'string',
                'distinct',
                Rule::in(['lgu', 'MPDOs', 'dswd', 'admin']),
            ],

            'status' => [
                'required',
                Rule::in(['Active', 'Inactive', 'Pending']),
            ],
        ]);

        Users::create($validated);

        return redirect()
            ->route('users.index')
            ->with('success', 'User account created successfully.');
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, Users $user): RedirectResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:100'],
            'middlename' => ['nullable', 'string', 'max:100'],
            'lastname' => ['required', 'string', 'max:100'],
            'contact_number' => ['required', 'string', 'max:30'],
            'gender' => ['required', Rule::in([
                'Male',
                'Female',
                'Other',
            ])],
            'address' => ['required', 'string', 'max:2000'],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],

            'lgu' => ['required', 'string', 'max:150'],
            'municipality' => ['required', 'string', 'max:150'],
            'district' => [
                'required',
                Rule::in($this->districtOptions()),
            ],

            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'required',
                'string',
                'distinct',
                Rule::in(['lgu', 'MPDOs', 'dswd', 'admin']),
            ],

            'status' => [
                'required',
                Rule::in(['Active', 'Inactive', 'Pending']),
            ],
        ]);

        // Do not overwrite the existing password with an empty value.
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('users.index')
            ->with('success', 'User account updated successfully.');
    }

    /**
     * Delete a user account.
     */
    public function destroy(Users $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'User account deleted successfully.');
    }

    /**
     * Allowed district names.
     */
    private function districtOptions(): array
    {
        return collect(range(1, 12))
            ->map(function ($number) {
                $suffix = match ($number) {
                    1 => 'st',
                    2 => 'nd',
                    3 => 'rd',
                    default => 'th',
                };

                return "{$number}{$suffix} District";
            })
            ->all();
    }
}
