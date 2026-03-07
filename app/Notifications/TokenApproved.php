<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TokenApproved extends Notification
{
    public function __construct(
        public string $token,
        public string $deviceName
    ) {}

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
            ->subject(' Token ESP32 aprobado')
            ->line("Tu solicitud para {$this->deviceName} fue aprobada.")
            ->line("Token: {$this->token}")
            ->line('Guárdalo. Se muestra solo una vez.')
            ->action('Ir al dashboard', url('/'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'token_approved',
            'device_name' => $this->deviceName,
            'token' => $this->token,
            'message' => 'Tu token fue aprobado.',
        ];
    }
}
