<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\WelcomePackage;
use App\Models\PackageVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Activity;

class HostDashboardController extends Controller
{
public function index(Request $request)
{
    // 1) User / plan
    $user   = $request->user();
    if ($request->boolean('upgraded') && app()->environment('local')) {
        $user->plan = 'pro';
        $user->stripe_status = 'active';
        $user->save();
    }
    $userId   = $user->id;
    $userPlan = $user->plan ?? 'free';
    $override = $user->properties_limit_override;

    // 2) Filters / sorting / pagination
    $q       = trim($request->query('q', ''));
    $sort    = $request->query('sort', 'new');
    $perPage = max(6, min(30, (int) $request->query('perPage', 9)));

    $props = \App\Models\Property::where('user_id', $userId)
        ->when($q !== '', function ($query) use ($q) {
            $query->where(function ($qq) use ($q) {
                $qq->where('title', 'like', "%{$q}%")
                   ->orWhere('address', 'like', "%{$q}%");
            });
        })
        ->with(['welcomePackages.visits'])
        ->when($sort === 'az', fn ($q) => $q->orderBy('title'))
        ->when($sort === 'new', fn ($q) => $q->latest())
        ->paginate($perPage)
        ->appends($request->query());

    // 3) Totals / stats
    $allProps       = \App\Models\Property::where('user_id', $userId)->with('welcomePackages')->get();
    $propertyCount  = $allProps->count();
    $totalPackages  = $allProps->sum(fn ($p) => $p->welcomePackages->count());
    $allPackageIds  = \App\Models\WelcomePackage::whereIn('property_id', $allProps->pluck('id'))->pluck('id');
    $totalVisits    = \App\Models\PackageVisit::whereIn('welcome_package_id', $allPackageIds)->count();
    $totalVisits7d  = \App\Models\PackageVisit::whereIn('welcome_package_id', $allPackageIds)
                        ->where('visited_at', '>=', now()->subDays(7))->count();

    // 4) Plan limits — Starter(free):1/1 | Growth:5/∞ | Pro:∞/∞ | Agency:∞/∞
    $propertyLimit = !is_null($override) ? $override : match($userPlan) {
        'pro', 'agency' => 9999,
        'growth', 'host' => 5, // host = legacy growth
        default => 1,
    };
    $canCreateProperty = $propertyCount < $propertyLimit;

    $activeStayCount = \App\Models\WelcomePackage::whereIn('property_id', $allProps->pluck('id'))
        ->whereDate('check_out_date', '>=', now()->toDateString())
        ->count();
    $stayLimit     = in_array($userPlan, ['growth', 'host', 'pro', 'agency']) ? 9999 : 1;
    $canCreateStay = $activeStayCount < $stayLimit;

    // 5) Recent activities  (← moved ABOVE the render)
 $activities = Activity::forUser($request->user()->id)
    ->latest()
    ->limit(8)
    ->get()
    ->map(function ($a) {
        $type = class_basename($a->subject_type ?? '');
     $openUrl = null; $editUrl = null;
if ($a->action !== 'deleted') {
    if ($type === 'WelcomePackage' && $a->subject_id) {
        if ($pkg = \App\Models\WelcomePackage::find($a->subject_id)) {
            $openUrl = route('packages.edit', $pkg->slug);
            $editUrl = $openUrl;
        }
    } elseif ($type === 'Property' && $a->subject_id) {
        $openUrl = route('properties.edit', $a->subject_id);
        $editUrl = $openUrl;
    }
}

        return [
            'id'           => $a->id,
            'title'        => $a->title ?? ucfirst($a->action),
            'subtitle'     => trim(($a->meta['guest'] ?? '').' • '.($a->meta['property_title'] ?? ''), ' •'),
            'action'       => strtolower($a->action ?? ''),   // created | updated | deleted
            'subjectType'  => $type,                           // Property | WelcomePackage
            'openUrl'      => $openUrl,
            'editUrl'      => $editUrl,
            'timestamp'    => $a->created_at->toIso8601String(),
        ];
    });

    // 6) Single render with all props (← no second return)
    return \Inertia\Inertia::render('Host/Dashboard', [
        'properties' => $props,
        'recentActivities' => \App\Models\Activity::where('user_id', auth()->id())
    ->where('action', 'guest_maintenance_reported')
    ->latest()
    ->take(5),
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
        'userMeta' => [
            'plan'       => $userPlan,
            'first_name' => explode(' ', $user->name ?? '')[0] ?? 'Host',
        ],
        'limits' => [
            'canCreateProperty' => $canCreateProperty,
            'canCreateStay'     => $canCreateStay,
            'propertyLimit'     => $propertyLimit,
            'propertyCount'     => $propertyCount,
            'activeStayCount'   => $activeStayCount,
            'stayLimit'         => $stayLimit,
        ],
        'recentlyUpgraded' => $request->boolean('upgraded', false),
        'activities'       => $activities,
        'stays'            => \App\Models\WelcomePackage::whereIn('property_id', $allProps->pluck('id'))
            ->where('check_out_date', '>=', now()->toDateString())
            ->orderBy('check_in_date')
            ->limit(10)
            ->get(['id','property_id','guest_first_name','check_in_date','check_out_date'])
            ->map(fn($s) => [
                'id'               => $s->id,
                'guest_first_name' => $s->guest_first_name,
                'check_in_date'    => $s->check_in_date,
                'check_out_date'   => $s->check_out_date,
                'property_title'   => $allProps->firstWhere('id', $s->property_id)?->title ?? '',
            ]),
        'onboarding' => [
            'step'    => $user->onboarding_step ?? 0,
            'skipped' => (bool) $user->onboarding_skipped_at,
        ],
    ]);
}



}
