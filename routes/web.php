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

// Middleware
use App\Http\Middleware\EnsureHost;

/*
|--------------------------------------------------------------------------
| Public marketing / landing
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

/*
|--------------------------------------------------------------------------
| Authenticated dashboard redirect
| - Sends user to the correct dashboard for their role.
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    $u = auth()->user();
    if (! $u) {
        return redirect()->route('login');
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


/*
|--------------------------------------------------------------------------
| Host / Admin area
| (must be logged in, and must be host or admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', EnsureHost::class])->group(function () {

    /*
    |-------------------------
    | Host dashboard
    |-------------------------
    */
    Route::get('/host/dashboard', [HostDashboardController::class, 'index'])
        ->name('host.dashboard');

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
});


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
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->name('stripe.webhook');


// Breeze / auth scaffolding
require __DIR__ . '/auth.php';
