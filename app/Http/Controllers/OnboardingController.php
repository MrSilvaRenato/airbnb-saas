<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function skip(Request $request)
    {
        $request->user()->update([
            'onboarding_skipped_at' => now(),
        ]);

        return back();
    }
}
