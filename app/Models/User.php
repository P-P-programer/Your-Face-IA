<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerifyEmailQueued;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'preferences',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function statuses()
    {
        return $this->hasMany(UserStatus::class);
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailQueued());
    }

    public function detections()
    {
        return $this->hasMany(Detection::class);
    }

    public function devices()
    {
        return $this->hasMany(DeviceRegistration::class);
    }

    public function connections()
    {
        return $this->hasMany(Connection::class);
    }
}
