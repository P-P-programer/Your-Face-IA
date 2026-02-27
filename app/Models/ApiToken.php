<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'token',
        'device_mac',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public static function generate($userId, $name, $deviceMac = null)
    {
        return self::create([
            'user_id' => $userId,
            'name' => $name,
            'token' => Str::random(60),
            'device_mac' => $deviceMac,
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
