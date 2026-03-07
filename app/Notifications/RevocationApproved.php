<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RevocationApproved extends Notification
{
    public function __construct(public string $deviceName, public ?string $notes = null) {}

    public function via(object $notifiable): array
    {
        $channels = [];
        if (config('notifications.channels.mail')) $channels[] = 'mail';
        if (config('notifications.channels.database')) $channels[] = 'database';
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Revocación aprobada')
            ->line("Se revocó el token del dispositivo {$this->deviceName}.");
        if ($this->notes) $mail->line("Notas: {$this->notes}");
        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'revocation_approved',
            'device_name' => $this->deviceName,
            'notes' => $this->notes,
        ];
    }
}
