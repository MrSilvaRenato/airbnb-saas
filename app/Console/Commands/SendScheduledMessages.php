<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduledMessages as SendScheduledMessagesJob;
use App\Models\ScheduledMessage;
use Illuminate\Console\Command;

class SendScheduledMessages extends Command
{
    protected $signature   = 'hostflows:send-messages {--dry-run : List due messages without sending}';
    protected $description = 'Send all scheduled guest messages that are due';

    public function handle(): int
    {
        $due = ScheduledMessage::where('status', 'pending')
            ->where('send_at', '<=', now())
            ->whereNotNull('recipient_email')
            ->count();

        if ($due === 0) {
            $this->info('No messages due.');
            return Command::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $rows = ScheduledMessage::where('status', 'pending')
                ->where('send_at', '<=', now())
                ->whereNotNull('recipient_email')
                ->get(['id', 'trigger', 'recipient_email', 'subject', 'send_at']);

            $this->table(
                ['ID', 'Trigger', 'To', 'Subject', 'Send at'],
                $rows->map(fn($m) => [$m->id, $m->trigger, $m->recipient_email, substr($m->subject, 0, 40), $m->send_at])
            );
            return Command::SUCCESS;
        }

        $this->info("Sending {$due} message(s)…");
        (new SendScheduledMessagesJob)->handle();
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
