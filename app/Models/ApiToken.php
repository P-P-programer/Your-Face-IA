<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiToken extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'token',
        'device_mac',
        'status',
        'revoked_at',
        'revoked_by',
    ];

    protected $casts = [
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function revocationRequests(): HasMany
    {
        return $this->hasMany(TokenRevocationRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRevoked($query)
    {
        return $query->where('status', 'revoked');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function revoke(int $revokedBy): void
    {
        $this->update([
            'status' => 'revoked',
            'revoked_at' => now(),
            'revoked_by' => $revokedBy,
        ]);
    }
}
