<?php

namespace App\Jobs;

use App\Mail\AutomatedGuestMail;
use App\Models\ScheduledMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendScheduledMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $due = ScheduledMessage::where('status', 'pending')
            ->where('send_at', '<=', now())
            ->whereNotNull('recipient_email')
            ->with('package')
            ->get();

        foreach ($due as $msg) {
            try {
                Mail::to($msg->recipient_email)->send(new AutomatedGuestMail($msg));
                $msg->update(['status' => 'sent', 'sent_at' => now()]);
            } catch (\Throwable $e) {
                $msg->update(['status' => 'failed', 'error' => substr($e->getMessage(), 0, 500)]);
            }
        }
    }
}
