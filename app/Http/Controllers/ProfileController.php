<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile page.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('Profile/Show');
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $removeLogo = (bool) ($validated['remove_brand_logo'] ?? false);
        unset($validated['brand_logo_file'], $validated['remove_brand_logo']);

        $user->fill($validated);

        if ($removeLogo && $user->brand_logo_path) {
            $storedPath = ltrim(str_replace('/storage/', '', $user->brand_logo_path), '/');
            Storage::disk('public')->delete($storedPath);
            $user->brand_logo_path = null;
        }

        if ($request->hasFile('brand_logo_file')) {
            if ($user->brand_logo_path) {
                $existingPath = ltrim(str_replace('/storage/', '', $user->brand_logo_path), '/');
                Storage::disk('public')->delete($existingPath);
            }

            $path = $request->file('brand_logo_file')->store('brand/users', 'public');
            $user->brand_logo_path = '/storage/' . $path;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.show');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
