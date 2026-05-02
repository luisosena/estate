<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Security Event Model
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $event_type
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $device_id
 * @property string|null $location
 * @property array|null $metadata
 * @property string $severity
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 */
class SecurityEvent extends Model
{
    /**
     * Event Types
     */
    public const EVENT_PASSWORD_CHANGED = 'password_changed';

    public const EVENT_PASSWORD_RESET_REQUESTED = 'password_reset_requested';

    public const EVENT_SUSPICIOUS_ACTIVITY = 'suspicious_activity';

    public const EVENT_UNUSUAL_LOCATION = 'unusual_location';

    public const EVENT_MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts';

    public const EVENT_TOKEN_REVOKED = 'token_revoked';

    public const EVENT_PROFILE_UPDATED = 'profile_updated';

    public const EVENT_SESSION_TERMINATED = 'session_terminated';

    public const EVENT_BIOMETRIC_ENABLED = 'biometric_enabled';

    public const EVENT_BIOMETRIC_DISABLED = 'biometric_disabled';

    public const EVENT_DEVICE_ADDED = 'device_added';

    public const EVENT_DEVICE_REMOVED = 'device_removed';

    /**
     * Severity Levels
     */
    public const SEVERITY_LOW = 'low';

    public const SEVERITY_MEDIUM = 'medium';

    public const SEVERITY_HIGH = 'high';

    public const SEVERITY_CRITICAL = 'critical';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'event_type',
        'ip_address',
        'user_agent',
        'device_id',
        'location',
        'metadata',
        'severity',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'severity' => 'string',
        ];
    }

    /**
     * Get the user that owns the security event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include security events for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include security events of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('event_type', $type);
    }

    /**
     * Scope a query to only include security events from the last N days.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope a query to only include high severity security events.
     */
    public function scopeHighSeverity($query)
    {
        return $query->whereIn('severity', [self::SEVERITY_HIGH, self::SEVERITY_CRITICAL]);
    }

    /**
     * Create and save a new security event.
     */
    public static function log(
        ?int $userId,
        string $eventType,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $deviceId = null,
        ?string $location = null,
        ?array $metadata = null,
        string $severity = self::SEVERITY_LOW
    ): static {
        return static::create([
            'user_id' => $userId,
            'event_type' => $eventType,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_id' => $deviceId,
            'location' => $location,
            'metadata' => $metadata,
            'severity' => $severity,
        ]);
    }

    /**
     * Get all event type constants.
     *
     * @return array<string, string>
     */
    public static function getEventTypes(): array
    {
        return [
            'PASSWORD_CHANGED' => self::EVENT_PASSWORD_CHANGED,
            'PASSWORD_RESET_REQUESTED' => self::EVENT_PASSWORD_RESET_REQUESTED,
            'SUSPICIOUS_ACTIVITY' => self::EVENT_SUSPICIOUS_ACTIVITY,
            'UNUSUAL_LOCATION' => self::EVENT_UNUSUAL_LOCATION,
            'MULTIPLE_FAILED_ATTEMPTS' => self::EVENT_MULTIPLE_FAILED_ATTEMPTS,
            'TOKEN_REVOKED' => self::EVENT_TOKEN_REVOKED,
            'PROFILE_UPDATED' => self::EVENT_PROFILE_UPDATED,
            'SESSION_TERMINATED' => self::EVENT_SESSION_TERMINATED,
            'BIOMETRIC_ENABLED' => self::EVENT_BIOMETRIC_ENABLED,
            'BIOMETRIC_DISABLED' => self::EVENT_BIOMETRIC_DISABLED,
            'DEVICE_ADDED' => self::EVENT_DEVICE_ADDED,
            'DEVICE_REMOVED' => self::EVENT_DEVICE_REMOVED,
        ];
    }

    /**
     * Get all severity constants.
     *
     * @return array<string, string>
     */
    public static function getSeverities(): array
    {
        return [
            'LOW' => self::SEVERITY_LOW,
            'MEDIUM' => self::SEVERITY_MEDIUM,
            'HIGH' => self::SEVERITY_HIGH,
            'CRITICAL' => self::SEVERITY_CRITICAL,
        ];
    }
}
