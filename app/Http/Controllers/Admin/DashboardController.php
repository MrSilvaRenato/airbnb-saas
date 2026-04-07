<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
    $users = User::withCount('properties')
    ->orderByDesc('created_at')
    ->get()
    ->map(fn($u) => [
        'id'               => $u->id,
        'name'             => $u->name,
        'email'            => $u->email,
        'role'             => $u->role,
        'plan'             => $u->plan,
        'stripe_status'    => $u->stripe_status,
        'properties_count' => $u->properties_count,
        'stays_count'      => \App\Models\WelcomePackage::whereHas('property', fn($q) => $q->where('user_id', $u->id))->count(),
        'joined'           => $u->created_at->toDateString(),
        'updated_at'       => $u->updated_at->toISOString(),
    ]);

        $pro  = $users->where('plan', 'pro')->count();
        $free = $users->where('plan', 'free')->count();

        return Inertia::render('Admin/Dashboard', [
            'users'  => $users,
            'totals' => [
                'total' => $users->count(),
                'pro'   => $pro,
                'free'  => $free,
                'mrr'   => $pro * 29,
            ],
        ]);
    }

    public function updatePlan(User $user)
    {
        $newPlan = $user->plan === 'pro' ? 'free' : 'pro';
        $user->update(['plan' => $newPlan]);
        return back();
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back();
    }
}