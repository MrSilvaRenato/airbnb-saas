<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class DispatchAutomatedMessages extends Command
{
    protected $signature = 'hostflows:dispatch-automated-messages';
    protected $description = 'Send pending scheduled guest emails';

    public function handle(): int
    {
        $messages = DB::table('scheduled_messages')
            ->where('status', 'pending')
            ->whereNull('sent_at')
            ->where('send_at', '<=', now())
            ->orderBy('send_at')
            ->get();

        if ($messages->isEmpty()) {
            $this->info('No scheduled messages due.');
            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($messages as $message) {
            try {
                Mail::raw($message->body, function ($mail) use ($message) {
                    $mail->to($message->recipient_email)
                        ->subject($message->subject);
                });

                DB::table('scheduled_messages')
                    ->where('id', $message->id)
                    ->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'updated_at' => now(),
                    ]);

                $this->info("Sent {$message->trigger} to {$message->recipient_email} (scheduled_message_id {$message->id})");
                $sent++;
            } catch (\Throwable $e) {
                DB::table('scheduled_messages')
                    ->where('id', $message->id)
                    ->update([
                        'status' => 'failed',
                        'error' => mb_substr($e->getMessage(), 0, 1000),
                        'updated_at' => now(),
                    ]);

                $this->error("Failed scheduled_message_id {$message->id}: {$e->getMessage()}");
            }
        }

        $this->info("Scheduled emails sent: {$sent}");

        return self::SUCCESS;
    }
}
