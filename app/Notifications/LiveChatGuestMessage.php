<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class LiveChatGuestMessage extends Notification
{
    use Queueable;

    public function __construct(
        public int $conversationId,
        public string $guestName,
        public string $messagePreview
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title('New live chat message')
            ->body("{$this->guestName}: {$this->messagePreview}")
            ->icon('/favicon.ico')
            ->badge('/favicon.ico')
            ->tag("chat-{$this->conversationId}")
            ->data([
                'url' => "/admin/dashboard?chat={$this->conversationId}",
            ]);
    }
}