<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\HostDashboardController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\WelcomePackageController;
use App\Http\Controllers\PackageSectionController;
use App\Http\Controllers\PublicPackageController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CheckoutPageController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ExportController;
// Middleware
use App\Http\Middleware\EnsureHost;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\PushSubscriptionController;

// ChatBot — public (guest)
Route::get('/chat-status', [ChatBotController::class, 'chatStatus']);
Route::post('/chat/start', [ChatBotController::class, 'startConversation']);
Route::post('/chat/{conversation}/message', [ChatBotController::class, 'guestMessage']);
Route::get('/chat/{conversation}/poll', [ChatBotController::class, 'poll']);

// ChatBot — admin
Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/admin/toggle-chat', [ChatBotController::class, 'toggleChat']);
    Route::get('/admin/chat/conversations', [ChatBotController::class, 'conversations']);
    Route::post('/admin/chat/{conversation}/reply', [ChatBotController::class, 'adminReply']);
    Route::post('/admin/chat/{conversation}/close', [ChatBotController::class, 'closeConversation']);
    Route::post('/admin/chat/{conversation}/read', [ChatBotController::class, 'markRead']);
    Route::post('/admin/chat/{conversation}/archive', [ChatBotController::class, 'archiveConversation']);
    Route::delete('/admin/chat/{conversation}', [ChatBotController::class, 'deleteConversation']);
    Route::post('/admin/chat/clear', [ChatBotController::class, 'clearConversations']);
    Route::post('/admin/chat/bulk', [ChatBotController::class, 'bulkAction']);
});

// Push Browser notifications for LiveChat to Admin
Route::post('/push/subscribe', [PushSubscriptionController::class, 'store'])->middleware('auth');

/*
|--------------------------------------------------------------------------
| Public marketing / landing
|--------------------------------------------------------------------------
*/

// ✅ Admin-only routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    
    Route::post('/users/{user}/plan', [DashboardController::class, 'updatePlan'])->name('admin.users.plan');
    Route::delete('/users/{user}', [DashboardController::class, 'destroy'])->name('admin.users.destroy');

    Route::post('/users/{user}/impersonate', [DashboardController::class, 'impersonate'])->name('admin.users.impersonate');

    Route::get('/refund-requests', [DashboardController::class, 'refundRequests'])->name('admin.refunds');
    Route::post('/refund-requests/{refund}/approve', [DashboardController::class, 'approveRefund'])->name('admin.refunds.approve');
    Route::post('/refund-requests/{refund}/deny', [DashboardController::class, 'denyRefund'])->name('admin.refunds.deny');
});


// ✅ IMPORTANT: OUTSIDE admin middleware
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::post('/stop-impersonating', [DashboardController::class, 'stopImpersonating'])
        ->name('admin.stop.impersonating');
});
/*
|--------------------------------------------------------------------------
| Authenticated dashboard redirect
| - Sends user to the correct dashboard for their role.
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    $u = auth()->user();
    if (! $u) {
        return redirect()->route('landing');
    }

    if (in_array($u->role, ['host', 'admin'])) {
        return redirect()->route('host.dashboard');
    }

    if ($u->role === 'tenant') {
        // placeholder tenant view
        return Inertia::render('Tenant/Dashboard');
    }

    // unexpected role
    abort(403);
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


/*
|--------------------------------------------------------------------------
| Host / Admin area
| (must be logged in, and must be host or admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', EnsureHost::class])->group(function () {
Route::middleware(['auth'])->group(function () {
    Route::post('/activities/clear', [ActivityController::class, 'clear'])
        ->name('activities.clear');
});
    /*
    |-------------------------
    | Host dashboard
    |-------------------------
    */
    Route::get('/host/dashboard', [HostDashboardController::class, 'index'])
        ->name('host.dashboard');

    Route::post('/onboarding/skip', [OnboardingController::class, 'skip'])
        ->name('onboarding.skip');

    Route::get('/host/analytics', [AnalyticsController::class, 'index'])
        ->name('host.analytics');

    Route::get('/host/calendar', [CalendarController::class, 'index'])
        ->name('host.calendar');

    Route::get('/host/maintenance', [MaintenanceController::class, 'index'])
        ->name('maintenance.index');
    Route::post('/host/maintenance', [MaintenanceController::class, 'store'])
        ->name('maintenance.store');
    Route::put('/host/maintenance/{task}', [MaintenanceController::class, 'update'])
        ->name('maintenance.update');
    Route::delete('/host/maintenance/{task}', [MaintenanceController::class, 'destroy'])
        ->name('maintenance.destroy');

    /*
    |-------------------------
    | Properties CRUD
    |-------------------------
    */
    Route::get('/properties/create', [PropertyController::class, 'create'])
        ->name('properties.create');

    Route::post('/properties', [PropertyController::class, 'store'])
        ->name('properties.store');

    Route::get('/properties/{property}/edit', [PropertyController::class, 'edit'])
        ->name('properties.edit');

    Route::put('/properties/{property}', [PropertyController::class, 'update'])
        ->name('properties.update');

    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])
        ->name('properties.destroy');

    /*
    |-------------------------
    | Welcome Packages (per property)
    |-------------------------
    | create/store a stay for a property
    */
    Route::get('/properties/{property}/package/create', [WelcomePackageController::class, 'create'])
        ->name('packages.create');

    Route::post('/properties/{property}/package', [WelcomePackageController::class, 'store'])
        ->name('packages.store');

    /*
    |-------------------------
    | Single Package editing / lifecycle
    |-------------------------
    | edit base info, update, delete, etc
    */
    Route::get('/packages/{package:slug}/edit', [PackageSectionController::class, 'edit'])
        ->name('packages.edit');

    Route::put('/packages/{package}', [WelcomePackageController::class, 'update'])
        ->name('packages.update');

    Route::delete('/packages/{package}', [WelcomePackageController::class, 'destroy'])
        ->name('packages.destroy');

    /*
    |-------------------------
    | Sections inside a package
    |-------------------------
    */
    Route::post('/packages/{package}/sections', [PackageSectionController::class, 'store'])
        ->name('sections.store');

    Route::put('/sections/{section}', [PackageSectionController::class, 'update'])
        ->name('sections.update');

    Route::delete('/sections/{section}', [PackageSectionController::class, 'destroy'])
        ->name('sections.destroy');

    Route::post('/packages/{package}/sections/reorder', [PackageSectionController::class, 'reorder'])
        ->name('sections.reorder');

    /*
    |-------------------------
    | CSV import / template for bulk info
    |-------------------------
    */
    Route::get('/properties/{property}/package/template', [WelcomePackageController::class, 'template'])
        ->name('packages.template');

    Route::post('/properties/{property}/package/import', [WelcomePackageController::class, 'import'])
        ->name('packages.import');

    /*
    |-------------------------
    | CSV Exports
    |-------------------------
    */
    Route::get('/export/stays',     [ExportController::class, 'stays'])     ->name('export.stays');
    Route::get('/export/analytics', [ExportController::class, 'analytics']) ->name('export.analytics');

    /*
    |-------------------------
    | Billing / Upgrade flow (host-facing)
    |-------------------------
    | /checkout       -> shows Free vs Pro comparison, Upgrade CTA
    | billing.checkout -> actually talks to Stripe (start checkout)
    | billing.success  -> Stripe return success landing
    | billing.cancel   -> Stripe return cancel landing
    */
    Route::get('/checkout', [CheckoutPageController::class, 'show'])
        ->name('checkout.show');

    // This is the "start Stripe Checkout Session" action.
    // If in your app this method is named upgrade() instead of startCheckout(),
    // keep the function name you already use.
    Route::post('/billing/checkout', [BillingController::class, 'upgrade'])
        ->name('billing.checkout');

    Route::get('/billing/success', [BillingController::class, 'success'])
        ->name('billing.success');

    Route::get('/billing/cancel', [BillingController::class, 'cancel'])
        ->name('billing.cancel');

    Route::get('/billing/manage', [BillingController::class, 'manage'])
        ->name('billing.manage');

    Route::post('/billing/portal', [BillingController::class, 'portal'])
        ->name('billing.portal');

    Route::post('/billing/cancel-subscription', [BillingController::class, 'cancelSubscription'])
        ->name('billing.cancel-subscription');

    Route::post('/billing/refund-request', [BillingController::class, 'refundRequest'])
        ->name('billing.refund-request');

    Route::post('/billing/upgrade-subscription', [BillingController::class, 'upgradeSubscription'])
        ->name('billing.upgrade-subscription');
});

// STRIPE WEBHOOK (public)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
/*
|--------------------------------------------------------------------------
| Public guest link
| - no auth required
|--------------------------------------------------------------------------
*/
Route::get('/p/{package:slug}', [PublicPackageController::class, 'show'])
    ->name('public.package');


    
/*
|--------------------------------------------------------------------------
| Stripe Webhook
| - no auth, Stripe calls this
|--------------------------------------------------------------------------
*/


// Redirect fall back

// Breeze / auth scaffolding
require __DIR__ . '/auth.php';


// Landing
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

// Friendly redirects that open the Landing modals
Route::get('/login', function () {
    return redirect()->route('landing', ['login' => 1]);   // 👈 send ?login=1 to Landing
})->name('login');

Route::get('/register', function () {
    return redirect()->route('landing', ['register' => 1]); // 👈 send ?register=1
})->name('register');

// ... keep the rest of your routes here ...

// 404 fallback LAST
Route::fallback(function () {
    return Inertia::render('Errors/404', [
        'status'  => 404,
        'message' => 'This page could not be found.',
    ])->toResponse(request())->setStatusCode(404);
});
