<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceRegistration extends Model
{
    protected $fillable = [
        'user_id',
        'device_name',
        'device_ip',
        'device_mac',
        'model',
        'status',
        'signal_strength',
        'connected_at',
        'disconnected_at',
        'last_heartbeat',
        'metadata',
    ];

    protected $casts = [
        'connected_at' => 'datetime',
        'disconnected_at' => 'datetime',
        'last_heartbeat' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function detections()
    {
        return $this->hasMany(Detection::class, 'device_ip', 'device_ip');
    }
}
