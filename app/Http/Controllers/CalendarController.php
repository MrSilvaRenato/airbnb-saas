<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\WelcomePackage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $month = $request->query('month', Carbon::now()->format('Y-m'));

        try {
            $date = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        } catch (\Exception $e) {
            $date = Carbon::now()->startOfMonth();
        }

        $rangeStart = $date->copy()->subMonth()->startOfMonth();
        $rangeEnd   = $date->copy()->addMonth()->endOfMonth();

        // Get all user properties with a color index
        $properties = Property::where('user_id', $user->id)
            ->orderBy('id')
            ->get(['id', 'title']);

        $propertyColorIndex = $properties->pluck('id')->flip(); // id => index

        // Get all stays in the 3-month window
        $stays = WelcomePackage::whereIn('property_id', $properties->pluck('id'))
            ->where('check_in_date', '<=', $rangeEnd->toDateString())
            ->where('check_out_date', '>=', $rangeStart->toDateString())
            ->with('property:id,title')
            ->get()
            ->map(function ($pkg) use ($propertyColorIndex) {
                return [
                    'id'             => $pkg->id,
                    'slug'           => $pkg->slug,
                    'check_in_date'  => $pkg->check_in_date,
                    'check_out_date' => $pkg->check_out_date,
                    'guest_name'     => $pkg->guest_first_name,
                    'property_id'    => $pkg->property_id,
                    'property_title' => $pkg->property?->title ?? '',
                    'color_index'    => $propertyColorIndex[$pkg->property_id] ?? 0,
                    'edit_url'       => route('packages.edit', $pkg->slug),
                ];
            });

        return Inertia::render('Host/Calendar', [
            'stays'       => $stays,
            'properties'  => $properties->map(fn ($p, $i) => [
                'id'          => $p->id,
                'title'       => $p->title,
                'color_index' => $i,
            ])->values(),
            'currentMonth' => $date->format('Y-m'),
            'monthLabel'   => $date->format('F Y'),
        ]);
    }
}
