<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\UpsellOffer;
use App\Models\UpsellOrder;
use App\Models\UpsellRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class UpsellOfferController extends Controller
{
    const COMMISSION_RATE = 0.15; // 15% platform commission

    // ── Host: manage offers for a property ──────────────────────────────────

    public function index(Request $request, Property $property)
    {
        abort_if($property->user_id !== $request->user()->id, 403);

        return Inertia::render('Host/Upsells/Index', [
            'property' => $property->only('id', 'title'),
            'offers'   => $property->upsellOffers()->orderBy('sort_order')->get()->map(fn($o) => [
                'id'             => $o->id,
                'title'          => $o->title,
                'description'    => $o->description,
                'price'          => $o->price,
                'enabled'        => $o->enabled,
                'sort_order'     => $o->sort_order,
                'requests_count' => $o->requests()->count(),
                'orders_count'   => $o->orders()->where('status', 'paid')->count(),
                'revenue'        => $o->orders()->where('status', 'paid')->sum('amount'),
                'commission'     => $o->orders()->where('status', 'paid')->sum('commission'),
            ]),
            'requests' => UpsellRequest::whereHas('offer', fn($q) => $q->where('property_id', $property->id))
                ->with('offer')->latest()->get()
                ->map(fn($r) => [
                    'id'         => $r->id,
                    'offer'      => $r->offer->title ?? '—',
                    'guest'      => $r->guest_name ?: $r->guest_email,
                    'message'    => $r->message,
                    'price'      => $r->offer->price,
                    'status'     => $r->status,
                    'created_at' => $r->created_at->diffForHumans(),
                ]),
            'orders' => UpsellOrder::whereHas('offer', fn($q) => $q->where('property_id', $property->id))
                ->with('offer')->latest()->get()
                ->map(fn($o) => [
                    'id'         => $o->id,
                    'offer'      => $o->offer->title ?? '—',
                    'guest'      => $o->guest_name ?: $o->guest_email,
                    'amount'     => $o->amount,
                    'commission' => $o->commission,
                    'status'     => $o->status,
                    'paid_at'    => $o->paid_at?->diffForHumans(),
                ]),
            'commission_rate' => self::COMMISSION_RATE,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(Request $request, Property $property)
    {
        abort_if($property->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'title'       => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'nullable|numeric|min:0|max:9999',
            'enabled'     => 'boolean',
        ]);

        $property->upsellOffers()->create(array_merge($data, [
            'sort_order' => $property->upsellOffers()->count(),
        ]));

        return back()->with('success', 'Offer added.');
    }

    public function update(Request $request, UpsellOffer $offer)
    {
        abort_if($offer->property->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'title'       => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'nullable|numeric|min:0|max:9999',
            'enabled'     => 'boolean',
        ]);

        $offer->update($data);
        return back()->with('success', 'Offer updated.');
    }

    public function destroy(Request $request, UpsellOffer $offer)
    {
        abort_if($offer->property->user_id !== $request->user()->id, 403);
        $offer->delete();
        return back()->with('success', 'Offer deleted.');
    }

    public function updateRequest(Request $request, UpsellRequest $upsellRequest)
    {
        abort_if($upsellRequest->offer->property->user_id !== $request->user()->id, 403);

        $request->validate(['status' => 'required|in:accepted,declined']);
        $upsellRequest->update(['status' => $request->status]);

        try {
            $offer = $upsellRequest->offer;
            $statusText = $request->status === 'accepted' ? 'accepted ✅' : 'declined';
            Mail::raw(
                "Hi {$upsellRequest->guest_name},\n\nYour request for \"{$offer->title}\" has been {$statusText} by the host.\n\nThanks,\nHostFlows",
                fn($m) => $m->to($upsellRequest->guest_email)->subject("Your request: {$offer->title}")
            );
        } catch (\Throwable) {}

        return back()->with('success', 'Request ' . $request->status . '.');
    }

    // ── Guest: free inquiry request ─────────────────────────────────────────

    public function guestRequest(Request $request, UpsellOffer $offer)
    {
        $data = $request->validate([
            'guest_email' => 'required|email|max:255',
            'guest_name'  => 'nullable|string|max:80',
            'message'     => 'nullable|string|max:500',
            'package_id'  => 'required|exists:welcome_packages,id',
        ]);

        $exists = UpsellRequest::where('upsell_offer_id', $offer->id)
            ->where('welcome_package_id', $data['package_id'])
            ->where('guest_email', $data['guest_email'])
            ->exists();

        if ($exists) {
            return back()->with('upsell_error', 'You already requested this.');
        }

        $upsellRequest = UpsellRequest::create([
            'upsell_offer_id'    => $offer->id,
            'welcome_package_id' => $data['package_id'],
            'guest_email'        => $data['guest_email'],
            'guest_name'         => $data['guest_name'],
            'message'            => $data['message'],
            'status'             => 'pending',
        ]);

        try {
            $host = $offer->property->user;
            $price = $offer->price ? 'A$' . number_format($offer->price, 2) : 'inquiry';
            Mail::raw(
                "New upsell request!\n\nOffer: {$offer->title} ({$price})\nGuest: {$data['guest_name']} <{$data['guest_email']}>\nMessage: " . ($data['message'] ?? '—') . "\n\nManage at: " . url('/host/properties/' . $offer->property_id . '/upsells'),
                fn($m) => $m->to($host->email)->subject("New request: {$offer->title}")
            );
            $upsellRequest->update(['host_notified_at' => now()]);
        } catch (\Throwable) {}

        return back()->with('upsell_success', 'Your request has been sent to the host!');
    }

    // ── Guest: Stripe payment ───────────────────────────────────────────────

    public function guestPay(Request $request, UpsellOffer $offer)
    {
        $data = $request->validate([
            'guest_email' => 'required|email|max:255',
            'guest_name'  => 'nullable|string|max:80',
            'message'     => 'nullable|string|max:500',
            'package_id'  => 'required|exists:welcome_packages,id',
        ]);

        abort_if(!$offer->price || $offer->price <= 0, 422, 'This offer does not have a fixed price.');
        abort_if(!$offer->enabled, 403);

        $package = \App\Models\WelcomePackage::findOrFail($data['package_id']);
        $amount  = (float) $offer->price;
        $commission = round($amount * self::COMMISSION_RATE, 2);

        // Create pending order first
        $order = UpsellOrder::create([
            'upsell_offer_id'    => $offer->id,
            'welcome_package_id' => $data['package_id'],
            'guest_email'        => $data['guest_email'],
            'guest_name'         => $data['guest_name'],
            'message'            => $data['message'],
            'amount'             => $amount,
            'commission'         => $commission,
            'status'             => 'pending',
        ]);

        Stripe::setApiKey(config('stripe.secret'));

        $session = StripeSession::create([
            'mode'                => 'payment',
            'customer_email'      => $data['guest_email'],
            'line_items'          => [[
                'quantity'   => 1,
                'price_data' => [
                    'currency'     => 'aud',
                    'unit_amount'  => (int) round($amount * 100), // cents
                    'product_data' => [
                        'name'        => $offer->title,
                        'description' => $offer->description ?: $offer->property->title,
                    ],
                ],
            ]],
            'metadata' => [
                'upsell_order_id' => $order->id,
                'offer_id'        => $offer->id,
                'package_id'      => $data['package_id'],
            ],
            'success_url' => url('/p/' . $package->slug) . '?upsell_paid=1',
            'cancel_url'  => url('/p/' . $package->slug) . '?upsell_cancelled=1',
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return redirect($session->url);
    }
}
