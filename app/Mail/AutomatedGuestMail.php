<?php

namespace App\Mail;

use App\Models\ScheduledMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AutomatedGuestMail extends Mailable
{
    use Queueable, SerializesModels;

    // NOTE: Do NOT name this $message — that conflicts with Laravel's
    // internal $message variable available in Blade mail views.
    public function __construct(public ScheduledMessage $msg) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->msg->subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.automated_guest');
    }
}
