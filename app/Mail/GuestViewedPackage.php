<?php

namespace App\Mail;

use App\Models\WelcomePackage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestViewedPackage extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public WelcomePackage $package) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your guest {$this->package->guest_first_name} just viewed their welcome page",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest_viewed',
        );
    }
}
