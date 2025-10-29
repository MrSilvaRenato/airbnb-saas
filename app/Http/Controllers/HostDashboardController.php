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
       $user = $request->user();

    // 👇 DEV-ONLY safety – immediately mark user pro *if* they just upgraded.
    // In production you rely on the webhook to do this, so we guard by env().
    if ($request->boolean('upgraded') && app()->environment('local')) {
        $user->plan = 'pro';
        $user->stripe_status = 'active';
        $user->save();
    }

    $userId    = $user->id;
    $userPlan  = $user->plan ?? 'free';
    $override  = $user->properties_limit_override;

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

    // 🔥 info for UI gating / banners
    'userMeta' => [
        'plan'       => $userPlan, // 'free' | 'pro'
        'first_name' => explode(' ', $request->user()->name ?? '')[0] ?? 'Host',
    ],

    'limits' => [
        'canCreateProperty' => $canCreateProperty,
        'canCreateStay'     => $canCreateStay,
        'propertyLimit'     => $propertyLimit,
        'propertyCount'     => $propertyCount,
        'activeStayCount'   => $activeStayCount,
        'stayLimit'         => $stayLimit,
    ],

    // 👇 lets us show the green success banner once
    'recentlyUpgraded' => $request->boolean('upgraded', false),
]);
    }
}
