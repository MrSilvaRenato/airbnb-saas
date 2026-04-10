<?php

namespace App\Jobs;

use App\Mail\GuestWelcomeMail;
use App\Models\WelcomePackage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendGuestWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public WelcomePackage $package) {}

    public function handle(): void
    {
        $package = $this->package->load('property.user');

        if (!$package->guest_email) {
            Log::warning("SendGuestWelcomeEmail: no guest email for package {$package->id}");
            return;
        }

        $welcomeUrl    = route('public.package', $package->slug);
        $propertyTitle = $package->property->title;
        $hostName      = $package->property->user->name ?? 'Your host';

        Mail::to($package->guest_email)->send(
            new GuestWelcomeMail($package, $welcomeUrl, $propertyTitle, $hostName)
        );

        $package->update(['sent_at' => now()]);

        Log::info("SendGuestWelcomeEmail: sent to {$package->guest_email} for package {$package->id}");
    }
}
