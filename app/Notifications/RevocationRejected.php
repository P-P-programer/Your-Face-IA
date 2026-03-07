<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RevocationRejected extends Notification
{
    public function __construct(public string $deviceName, public string $reason) {}

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
            ->subject(' Revocación rechazada')
            ->line("No se aprobó la revocación para {$this->deviceName}.")
            ->line("Motivo: {$this->reason}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'revocation_rejected',
            'device_name' => $this->deviceName,
            'reason' => $this->reason,
        ];
    }
}
