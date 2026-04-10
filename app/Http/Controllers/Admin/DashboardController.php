<?php
namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;
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
        $host = $users->where('plan', 'host')->count();
        $free = $users->where('plan', 'free')->count();

        return Inertia::render('Admin/Dashboard', [
            'users'  => $users,
            'totals' => [
                'total' => $users->count(),
                'pro'   => $pro,
                'host'  => $host,
                'free'  => $free,
                'mrr'   => ($host * 19) + ($pro * 49),
            ],
        ]);
    }

    public function updatePlan(User $user)
    {
        $newPlan = match($user->plan) {
            'free'  => 'host',
            'host'  => 'pro',
            'pro'   => 'free',
            default => 'host',
        };
        $user->update(['plan' => $newPlan]);
        return back();
    }

    public function impersonate(User $user)
{
    session(['impersonating_as' => $user->id, 'original_admin_id' => auth()->id()]);
    Auth::login($user);
    return redirect()->route('host.dashboard');
}

public function stopImpersonating()
{
    $adminId = session('original_admin_id');
    session()->forget(['impersonating_as', 'original_admin_id']);
    Auth::loginUsingId($adminId);
    return redirect()->route('admin.dashboard');
}

    public function destroy(User $user)
    {
        $user->delete();
        return back();
    }
}