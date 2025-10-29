<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\WelcomePackage;
use App\Models\PackageVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class HostDashboardController extends Controller
{
    public function index(Request $request)
    {
        // ---------------------------------
        // 1. Current user context
        // ---------------------------------
        $user      = $request->user();
        $userId    = $user->id;
        $userPlan  = $user->plan ?? 'free'; // 'free' | 'pro'
        $override  = $user->properties_limit_override; // nullable int

        // ---------------------------------
        // 2. Filters / sorting / pagination
        // ---------------------------------
        $q = trim($request->query('q', ''));
        $sort = $request->query('sort', 'new');
        $perPage = max(6, min(30, (int)$request->query('perPage', 9)));

        $props = Property::where('user_id', $userId)
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('title', 'like', "%{$q}%")
                       ->orWhere('address', 'like', "%{$q}%");
                });
            })
            ->with(['welcomePackages.visits'])
            ->when($sort === 'az', fn($q) => $q->orderBy('title'))
            ->when($sort === 'new', fn($q) => $q->latest())
            ->paginate($perPage)
            ->appends($request->query());

        // ---------------------------------
        // 3. Totals / stats for dashboard cards
        // ---------------------------------
        $allProps = Property::where('user_id', $userId)
            ->with('welcomePackages')
            ->get();

        $totalPackages = $allProps->sum(fn ($p) => $p->welcomePackages->count());

        $allPackageIds = WelcomePackage::whereIn('property_id', $allProps->pluck('id'))
            ->pluck('id');

        $totalVisits = PackageVisit::whereIn('welcome_package_id', $allPackageIds)->count();

        $totalVisits7d = PackageVisit::whereIn('welcome_package_id', $allPackageIds)
            ->where('visited_at', '>=', now()->subDays(7))
            ->count();

        // ---------------------------------
        // 4. Plan limits logic
        // ---------------------------------
        // PROPERTY LIMIT
        // - pro: effectively unlimited
        // - free: limit 1
        // - override: manual override always wins if not null
        $propertyCount = $allProps->count();

        if (!is_null($override)) {
            $propertyLimit = $override;
        } else {
            $propertyLimit = ($userPlan === 'pro') ? 9999 : 1;
        }

        $canCreateProperty = $propertyCount < $propertyLimit;

        // ACTIVE STAY LIMIT
        // - "active upcoming stay" = check_out_date >= today
        // - pro: unlimited
        // - free: limit 1
        $activeStayCount = WelcomePackage::query()
            ->whereIn('property_id', $allProps->pluck('id'))
            ->whereDate('check_out_date', '>=', now()->toDateString())
            ->count();

        $stayLimit = ($userPlan === 'pro') ? 9999 : 1;
        $canCreateStay = $activeStayCount < $stayLimit;

        // ---------------------------------
        // 5. Return to Inertia with new props
        // ---------------------------------
        return Inertia::render('Host/Dashboard', [
            'properties' => $props,

            'totals' => [
                'properties' => $propertyCount,
                'packages'   => $totalPackages,
                'visits'     => $totalVisits,
                'visits7d'   => $totalVisits7d,
            ],

            'filters' => [
                'q'       => $q,
                'sort'    => $sort,
                'perPage' => $perPage,
            ],

            // 🔥 NEW: info for UI gating and upsell
            'userMeta' => [
                'plan' => $userPlan,
            ],
            'limits' => [
                'canCreateProperty' => $canCreateProperty,
                'canCreateStay'     => $canCreateStay,
                'propertyLimit'     => $propertyLimit,
                'propertyCount'     => $propertyCount,
                'activeStayCount'   => $activeStayCount,
                'stayLimit'         => $stayLimit,
            ],
        ]);
    }
}
