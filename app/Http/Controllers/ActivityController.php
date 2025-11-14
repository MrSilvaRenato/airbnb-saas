<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;

class ActivityController extends Controller
{
    public function clear(Request $request)
    {
        Activity::where('user_id', $request->user()->id)->delete();

        return back()->with('success', 'Activity history cleared.');
    }
}
