<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TokenRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $reason) {}

    public function via(object $notifiable): array
    {
        $channels = [];
        if (config('notifications.channels.mail')) $channels[] = 'mail';
        if (config('notifications.channels.database')) $channels[] = 'database';
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(' Solicitud de token rechazada')
            ->line('Tu solicitud fue rechazada.')
            ->line("Motivo: {$this->reason}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'token_rejected',
            'reason' => $this->reason,
            'message' => 'Tu solicitud de token fue rechazada.',
        ];
    }
}
