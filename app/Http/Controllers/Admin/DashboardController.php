<?php
namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
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

        $growth = $users->where('plan', 'growth')->count();
        $host   = $users->where('plan', 'host')->count();   // legacy name for growth tier
        $pro    = $users->where('plan', 'pro')->count();
        $agency = $users->where('plan', 'agency')->count();
        $free   = $users->where('plan', 'free')->count();

        return Inertia::render('Admin/Dashboard', [
            'users'  => $users,
            'totals' => [
                'total'  => $users->count(),
                'growth' => $growth + $host,
                'pro'    => $pro,
                'agency' => $agency,
                'free'   => $free,
                'mrr'    => (($growth + $host) * 29) + ($pro * 79) + ($agency * 199),
            ],
        ]);
    }

    public function updatePlan(User $user)
    {
        $newPlan = match($user->plan) {
            'free'   => 'growth',
            'growth' => 'pro',
            'host'   => 'pro',    // legacy host → upgrade to pro
            'pro'    => 'agency',
            'agency' => 'free',
            default  => 'growth',
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

    public function refundRequests()
    {
        $refunds = RefundRequest::with('user')
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'user_name'    => $r->user->name,
                'user_email'   => $r->user->email,
                'plan'         => $r->plan,
                'amount'       => $r->amount,
                'reason'       => $r->reason,
                'status'       => $r->status,
                'admin_notes'  => $r->admin_notes,
                'days_ago'     => $r->created_at->diffInDays(now()),
                'created_at'   => $r->created_at->toDateString(),
                'sub_started'  => $r->subscription_started_at?->toDateString(),
            ]);

        return Inertia::render('Admin/RefundRequests', [
            'refunds' => $refunds,
            'pending' => $refunds->where('status', 'pending')->count(),
        ]);
    }

    public function approveRefund(Request $request, RefundRequest $refund)
    {
        $request->validate(['admin_notes' => 'nullable|string|max:1000']);
        $refund->update(['status' => 'approved', 'admin_notes' => $request->admin_notes]);

        // Optionally: trigger Stripe refund via API here
        // \Stripe\Stripe::setApiKey(config('stripe.secret'));
        // \Stripe\Refund::create(['customer' => $refund->user->stripe_customer_id, 'amount' => $refund->amount * 100]);

        return back()->with('success', 'Refund approved.');
    }

    public function denyRefund(Request $request, RefundRequest $refund)
    {
        $request->validate(['admin_notes' => 'nullable|string|max:1000']);
        $refund->update(['status' => 'denied', 'admin_notes' => $request->admin_notes]);
        return back()->with('success', 'Refund denied.');
    }
}