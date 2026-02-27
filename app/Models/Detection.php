<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Detection extends Model
{
    protected $fillable = [
        'user_id',
        'device_ip',
        'face_count',
        'confidence',
        'image_path',
        'status',
        'metadata',
        'detected_at',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'metadata' => 'array',
        'confidence' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
