<?php

namespace App\Mail;

use App\Models\WelcomePackage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public WelcomePackage $package,
        public string $welcomeUrl,
        public string $propertyTitle,
        public string $hostName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your welcome guide for {$this->propertyTitle} is ready 🏡",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest_welcome',
        );
    }
}
