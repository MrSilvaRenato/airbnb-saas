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
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\IcalFeedController;
use App\Http\Controllers\MessageTemplateController;
use App\Http\Controllers\UpsellOfferController;
use App\Http\Controllers\EngagementController;
use App\Http\Middleware\EnsureHost;

/*
|--------------------------------------------------------------------------
| Landing — must come BEFORE auth.php so the named routes 'login' and
| 'register' below override Breeze's form-based equivalents.
|--------------------------------------------------------------------------
*/
Route::get('/', fn() => Inertia::render('Landing'))->name('landing');

// Redirect /login and /register to Landing modals instead of Breeze pages.
// These must be defined BEFORE require auth.php so they take precedence.
Route::get('/login',    fn() => redirect()->route('landing', ['login'    => 1]))->name('login');
Route::get('/register', fn() => redirect()->route('landing', ['register' => 1]))->name('register');

// Profile
Route::middleware('auth')->group(function () {
    Route::get('/profile',        [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit',   [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile',       [ProfileController::class, 'update']);           // method spoofing via _method=PATCH
    Route::patch('/profile',      [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile',     [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Automated messaging templates
  Route::get('/messaging/templates', [MessageTemplateController::class, 'index'])->name('messaging.templates');
Route::get('/messaging/templates/{template}/edit', [MessageTemplateController::class, 'edit'])->name('messaging.templates.edit');
Route::put('/messaging/templates/{template}', [MessageTemplateController::class, 'update'])->name('messaging.templates.update');
Route::delete('/messaging/templates/{template}', [MessageTemplateController::class, 'destroy'])->name('messaging.templates.destroy');

    // Upsell offers (host management)
    Route::get('/host/properties/{property}/upsells',        [UpsellOfferController::class, 'index'])->name('upsells.index');
    Route::post('/host/properties/{property}/upsells',       [UpsellOfferController::class, 'store'])->name('upsells.store');
    Route::patch('/host/upsells/{offer}',                    [UpsellOfferController::class, 'update'])->name('upsells.update');
    Route::delete('/host/upsells/{offer}',                   [UpsellOfferController::class, 'destroy'])->name('upsells.destroy');
    Route::patch('/host/upsell-requests/{upsellRequest}',    [UpsellOfferController::class, 'updateRequest'])->name('upsells.requests.update');
});

/*
|--------------------------------------------------------------------------
| Public — no auth required
|--------------------------------------------------------------------------
*/

// ChatBot (guest-facing)
Route::get('/chat-status',                     [ChatBotController::class, 'chatStatus']);
Route::post('/chat/start',                     [ChatBotController::class, 'startConversation']);
Route::post('/chat/{conversation}/message',    [ChatBotController::class, 'guestMessage']);
Route::get('/chat/{conversation}/poll',        [ChatBotController::class, 'poll']);

// Public guest welcome guide
Route::get('/p/{package:slug}', [PublicPackageController::class, 'show'])->name('public.package');

// Guest upsell (no auth)
Route::post('/upsells/{offer}/request', [UpsellOfferController::class, 'guestRequest'])->name('upsells.guest.request');
Route::post('/upsells/{offer}/pay',     [UpsellOfferController::class, 'guestPay'])->name('upsells.guest.pay');

// Guest engagement beacon (no auth — sendBeacon from public page)
Route::post('/engagement/track', [EngagementController::class, 'track'])->name('engagement.track');

// Stripe webhook (no auth — Stripe calls this)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Push notifications subscribe
Route::post('/push/subscribe', [PushSubscriptionController::class, 'store'])->middleware('auth');

/*
|--------------------------------------------------------------------------
| Authenticated — any role
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Dashboard redirect by role
    Route::get('/dashboard', function () {
        $u = auth()->user();
        if (in_array($u->role, ['host', 'admin'])) {
            return redirect()->route('host.dashboard');
        }
        if ($u->role === 'tenant') {
            return Inertia::render('Tenant/Dashboard');
        }
        abort(403);
    })->name('dashboard');

    // Profile (available to all authenticated users)
    Route::get('/profile',     [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit',[ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile',    [ProfileController::class, 'update']);         // _method=PATCH fallback
    Route::patch('/profile',   [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile',  [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Stop impersonating (must be reachable even without EnsureHost so admin can exit)
    Route::post('/admin/stop-impersonating', [DashboardController::class, 'stopImpersonating'])
        ->name('admin.stop.impersonating');
});

/*
|--------------------------------------------------------------------------
| Admin-only
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard',                              [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::post('/users/{user}/plan',                     [DashboardController::class, 'updatePlan'])->name('admin.users.plan');
    Route::delete('/users/{user}',                        [DashboardController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/{user}/impersonate',              [DashboardController::class, 'impersonate'])->name('admin.users.impersonate');
    Route::get('/refund-requests',                        [DashboardController::class, 'refundRequests'])->name('admin.refunds');
    Route::post('/refund-requests/{refund}/approve',      [DashboardController::class, 'approveRefund'])->name('admin.refunds.approve');
    Route::post('/refund-requests/{refund}/deny',         [DashboardController::class, 'denyRefund'])->name('admin.refunds.deny');

    // Admin chat
    Route::post('/toggle-chat',                           [ChatBotController::class, 'toggleChat']);
    Route::get('/chat/conversations',                     [ChatBotController::class, 'conversations']);
    Route::post('/chat/{conversation}/reply',             [ChatBotController::class, 'adminReply']);
    Route::post('/chat/{conversation}/close',             [ChatBotController::class, 'closeConversation']);
    Route::post('/chat/{conversation}/read',              [ChatBotController::class, 'markRead']);
    Route::post('/chat/{conversation}/archive',           [ChatBotController::class, 'archiveConversation']);
    Route::delete('/chat/{conversation}',                 [ChatBotController::class, 'deleteConversation']);
    Route::post('/chat/clear',                            [ChatBotController::class, 'clearConversations']);
    Route::post('/chat/bulk',                             [ChatBotController::class, 'bulkAction']);
});

/*
|--------------------------------------------------------------------------
| Host / Admin area  (auth + EnsureHost)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', EnsureHost::class])->group(function () {
Route::get('/host/dashboard', [HostDashboardController::class, 'index'])
    ->name('host.dashboard');

    Route::get('/host/calendar', [CalendarController::class, 'index'])->name('host.calendar');

    // Onboarding
    Route::post('/onboarding/skip', [OnboardingController::class, 'skip'])->name('onboarding.skip');

    // Analytics
    Route::get('/host/analytics', [AnalyticsController::class, 'index'])->name('host.analytics');

    // Maintenance (pro/agency only — gated inside controller)
    Route::get('/host/maintenance',             [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/host/maintenance',            [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::put('/host/maintenance/{task}',      [MaintenanceController::class, 'update'])->name('maintenance.update');
    Route::delete('/host/maintenance/{task}',   [MaintenanceController::class, 'destroy'])->name('maintenance.destroy');

    // Activity feed
    Route::post('/activities/clear', [ActivityController::class, 'clear'])->name('activities.clear');


    /*
    | Upsell offers (growth/pro/agency — gated inside controller)
    */
    Route::get('/host/properties/{property}/upsells',       [UpsellOfferController::class, 'index'])->name('upsells.index');
    Route::post('/host/properties/{property}/upsells',      [UpsellOfferController::class, 'store'])->name('upsells.store');
    Route::patch('/host/upsells/{offer}',                   [UpsellOfferController::class, 'update'])->name('upsells.update');
    Route::delete('/host/upsells/{offer}',                  [UpsellOfferController::class, 'destroy'])->name('upsells.destroy');
    Route::patch('/host/upsell-requests/{upsellRequest}',   [UpsellOfferController::class, 'updateRequest'])->name('upsells.requests.update');

    /*
    | Properties CRUD
    */
    Route::get('/properties/create',            [PropertyController::class, 'create'])->name('properties.create');
    Route::post('/properties',                  [PropertyController::class, 'store'])->name('properties.store');
    Route::get('/properties/{property}/edit',   [PropertyController::class, 'edit'])->name('properties.edit');
    Route::put('/properties/{property}',        [PropertyController::class, 'update'])->name('properties.update');
    Route::delete('/properties/{property}',     [PropertyController::class, 'destroy'])->name('properties.destroy');

    // iCal feeds
    Route::post('/properties/{property}/ical',      [IcalFeedController::class, 'store'])->name('ical.store');
    Route::post('/properties/{property}/ical/sync', [IcalFeedController::class, 'sync'])->name('ical.sync');
    Route::delete('/properties/{property}/ical',    [IcalFeedController::class, 'destroy'])->name('ical.destroy');

    /*
    | Stays (Welcome Packages)
    */
    Route::get('/properties/{property}/package/create',   [WelcomePackageController::class, 'create'])->name('packages.create');
    Route::post('/properties/{property}/package',         [WelcomePackageController::class, 'store'])->name('packages.store');
    Route::get('/properties/{property}/package/template', [WelcomePackageController::class, 'template'])->name('packages.template');
    Route::post('/properties/{property}/package/import',  [WelcomePackageController::class, 'import'])->name('packages.import');

    Route::get('/packages/{package:slug}/edit', [PackageSectionController::class, 'edit'])->name('packages.edit');
    Route::put('/packages/{package}',           [WelcomePackageController::class, 'update'])->name('packages.update');
    Route::delete('/packages/{package}',        [WelcomePackageController::class, 'destroy'])->name('packages.destroy');

    // Sections inside a stay
    Route::post('/packages/{package}/sections',          [PackageSectionController::class, 'store'])->name('sections.store');
    Route::put('/sections/{section}',                    [PackageSectionController::class, 'update'])->name('sections.update');
    Route::delete('/sections/{section}',                 [PackageSectionController::class, 'destroy'])->name('sections.destroy');
    Route::post('/packages/{package}/sections/reorder',  [PackageSectionController::class, 'reorder'])->name('sections.reorder');

    /*
    | CSV exports
    */
    Route::get('/export/stays',     [ExportController::class, 'stays'])->name('export.stays');
    Route::get('/export/analytics', [ExportController::class, 'analytics'])->name('export.analytics');

    /*
    | Billing / Upgrade flow
    */
    Route::get('/checkout',                         [CheckoutPageController::class, 'show'])->name('checkout.show');
    Route::post('/billing/checkout',                [BillingController::class, 'upgrade'])->name('billing.checkout');
    Route::get('/billing/success',                  [BillingController::class, 'success'])->name('billing.success');
    Route::get('/billing/cancel',                   [BillingController::class, 'cancel'])->name('billing.cancel');
    Route::get('/billing/manage',                   [BillingController::class, 'manage'])->name('billing.manage');
    Route::post('/billing/portal',                  [BillingController::class, 'portal'])->name('billing.portal');
    Route::post('/billing/cancel-subscription',     [BillingController::class, 'cancelSubscription'])->name('billing.cancel-subscription');
    Route::post('/billing/refund-request',          [BillingController::class, 'refundRequest'])->name('billing.refund-request');
    Route::post('/billing/upgrade-subscription',    [BillingController::class, 'upgradeSubscription'])->name('billing.upgrade-subscription');
});

/*
|--------------------------------------------------------------------------
| 404 fallback — must be last
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';

Route::fallback(function () {
    return Inertia::render('Errors/404', [
        'status'  => 404,
        'message' => 'This page could not be found.',
    ])->toResponse(request())->setStatusCode(404);
});
