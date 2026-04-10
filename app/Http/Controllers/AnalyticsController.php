<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\WelcomePackage;
use App\Models\PackageVisit;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user     = $request->user();
        $userPlan = $user->plan ?? 'free';

        // Gate: only host and pro can access analytics
        if (!in_array($userPlan, ['host', 'pro'])) {
            return redirect()->route('checkout.show');
        }

        $isPro       = $userPlan === 'pro';
        $propertyIds = Property::where('user_id', $user->id)->pluck('id');
        $packageIds  = WelcomePackage::whereIn('property_id', $propertyIds)->pluck('id');

        // --- Visits per stay (last 10 stays by visit count) ---
        $visitsByStay = WelcomePackage::whereIn('id', $packageIds)
            ->withCount('visits')
            ->orderByDesc('visits_count')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'label'  => ($p->guest_first_name ?? 'Guest') . ' — ' . ($p->check_in_date ?? ''),
                'visits' => $p->visits_count,
                'slug'   => $p->slug,
            ]);

        // --- Visits last 7 days (daily breakdown) ---
        $visits7d = collect(range(6, 0))->map(function ($daysAgo) use ($packageIds) {
            $date = Carbon::today()->subDays($daysAgo);
            return [
                'date'  => $date->format('D'),
                'count' => PackageVisit::whereIn('welcome_package_id', $packageIds)
                    ->whereDate('visited_at', $date)
                    ->count(),
            ];
        });

        // --- Occupancy per property (current + upcoming stays / 90-day window) ---
        $occupancy = Property::where('user_id', $user->id)
            ->with(['welcomePackages' => function ($q) {
                $q->whereDate('check_out_date', '>=', Carbon::today()->subDays(90))
                  ->whereDate('check_in_date', '<=', Carbon::today()->addDays(90));
            }])
            ->get()
            ->map(function ($property) {
                $bookedDays = $property->welcomePackages->sum(function ($pkg) {
                    if (!$pkg->check_in_date || !$pkg->check_out_date) return 0;
                    $start = max(
                        Carbon::parse($pkg->check_in_date),
                        Carbon::today()->subDays(90)
                    );
                    $end = min(
                        Carbon::parse($pkg->check_out_date),
                        Carbon::today()->addDays(90)
                    );
                    return max(0, $start->diffInDays($end));
                });
                $windowDays = 180;
                return [
                    'property'    => $property->title,
                    'bookedDays'  => $bookedDays,
                    'windowDays'  => $windowDays,
                    'pct'         => $windowDays > 0 ? round(($bookedDays / $windowDays) * 100) : 0,
                    'stays'       => $property->welcomePackages->count(),
                ];
            });

        // --- Revenue by month (Pro only) ---
        $revenueByMonth = [];
        if ($isPro) {
            $revenueByMonth = WelcomePackage::whereIn('property_id', $propertyIds)
                ->whereNotNull('price_total')
                ->where('price_total', '>', 0)
                ->selectRaw("strftime('%Y-%m', check_in_date) as month, SUM(price_total) as revenue, COUNT(*) as stays")
                ->groupBy('month')
                ->orderBy('month')
                ->limit(12)
                ->get()
                ->map(fn($r) => [
                    'month'   => $r->month,
                    'revenue' => (float) $r->revenue,
                    'stays'   => $r->stays,
                ]);
        }

        // --- Summary KPIs ---
        $totalVisits   = PackageVisit::whereIn('welcome_package_id', $packageIds)->count();
        $visits7dTotal = PackageVisit::whereIn('welcome_package_id', $packageIds)
            ->where('visited_at', '>=', Carbon::today()->subDays(7))
            ->count();
        $totalStays    = WelcomePackage::whereIn('property_id', $propertyIds)->count();
        $totalRevenue  = $isPro
            ? WelcomePackage::whereIn('property_id', $propertyIds)->sum('price_total')
            : null;

        return Inertia::render('Host/Analytics', [
            'userPlan'       => $userPlan,
            'isPro'          => $isPro,
            'kpis'           => [
                'totalVisits'   => $totalVisits,
                'visits7d'      => $visits7dTotal,
                'totalStays'    => $totalStays,
                'totalRevenue'  => $totalRevenue,
            ],
            'visitsByStay'   => $visitsByStay,
            'visits7d'       => $visits7d,
            'occupancy'      => $occupancy,
            'revenueByMonth' => $revenueByMonth,
        ]);
    }
}
