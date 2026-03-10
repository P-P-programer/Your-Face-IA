<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;

class VerifyEmailQueued extends VerifyEmail
{
    // Sin ShouldQueue - se envía DIRECTAMENTE
    // Respeta el MAIL_MAILER del .env actual
}