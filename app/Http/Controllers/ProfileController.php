<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Property;
use App\Models\WelcomePackage;
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
    public function show(Request $request): Response
    {
        $user = $request->user();
        $propertiesCount = Property::where('user_id', $user->id)->count();
        $staysCount = WelcomePackage::whereHas('property', fn($q) => $q->where('user_id', $user->id))->count();

        return Inertia::render('Profile/Show', [
            'user'            => array_merge(
                $user->only('id','name','email','plan','role','profile_photo','tagline','bio','location','website','phone','created_at'),
                ['tagline' => $user->tagline ?: null]  // ensure host_display_name never bleeds in
            ),
            'propertiesCount' => $propertiesCount,
            'staysCount'      => $staysCount,
        ]);
    }

    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->safe()->except('profile_photo');

        if ($request->hasFile('profile_photo')) {
            // Remove old photo
            if ($user->profile_photo) {
                $old = str_replace('/storage/', '', $user->profile_photo);
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $data['profile_photo'] = '/storage/' . $path;
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
