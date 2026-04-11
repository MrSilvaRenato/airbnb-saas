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

        // start = beginning of current week (Mon), show 5 weeks = 35 days
        $startParam = $request->query('start');
        $start = $startParam
            ? Carbon::parse($startParam)->startOfDay()
            : Carbon::now()->startOfWeek(Carbon::MONDAY);

        $end = $start->copy()->addDays(34)->endOfDay();

        $properties = Property::where('user_id', $user->id)
            ->orderBy('id')
            ->get(['id', 'title']);

        $colorMap = $properties->pluck('id')->flip();

        $stays = WelcomePackage::whereIn('property_id', $properties->pluck('id'))
            ->where('check_in_date', '<=', $end->toDateString())
            ->where('check_out_date', '>=', $start->toDateString())
            ->get(['id', 'property_id', 'guest_first_name', 'check_in_date', 'check_out_date', 'guest_count', 'price_total'])
            ->map(fn($p) => [
                'id'             => $p->id,
                'property_id'    => $p->property_id,
                'guest_name'     => $p->guest_first_name,
                'guest_count'    => $p->guest_count,
                'price_total'    => $p->price_total,
                'check_in_date'  => $p->check_in_date,
                'check_out_date' => $p->check_out_date,
                'color_index'    => $colorMap[$p->property_id] ?? 0,
                'edit_url'       => route('packages.edit', $p->id),
            ]);

        // Build days array
        $days = [];
        for ($i = 0; $i < 35; $i++) {
            $days[] = $start->copy()->addDays($i)->toDateString();
        }

        return Inertia::render('Host/Calendar', [
            'stays'      => $stays,
            'properties' => $properties->map(fn($p, $i) => ['id' => $p->id, 'title' => $p->title, 'color_index' => $i])->values(),
            'days'       => $days,
            'startDate'  => $start->toDateString(),
            'prevStart'  => $start->copy()->subDays(35)->toDateString(),
            'nextStart'  => $start->copy()->addDays(35)->toDateString(),
        ]);
    }
}
