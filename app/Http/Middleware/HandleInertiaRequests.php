<?php

namespace App\Http\Middleware;

use App\Models\PackageVisit;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        $manifest = public_path('build/manifest.json');

        if (file_exists($manifest)) {
            return md5_file($manifest);
        }

        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user()
                ? $request->user()->only(
                    'id',
                    'name',
                    'email',
                    'phone',
                    'business_name',
                    'host_display_name',
                    'profile_bio',
                    'brand_logo_path',
                    'role',
                    'plan',
                    'notify_on_guest_view'
                )
                : null,
        ],
        'flash' => [
            'success' => fn() => $request->session()->get('success'),
            'error'   => fn() => $request->session()->get('error'),
        ],
        'impersonating' => session()->has('impersonating_as'),
        'unreadVisits'  => function () use ($request) {
            if (!$request->user()) return 0;
            $propertyIds = Property::where('user_id', $request->user()->id)->pluck('id');
            if ($propertyIds->isEmpty()) return 0;
            return PackageVisit::whereHas('welcomePackage', fn($q) => $q->whereIn('property_id', $propertyIds))
                ->where('visited_at', '>=', now()->subHours(24))
                ->count();
        },
    ]);
}
}
