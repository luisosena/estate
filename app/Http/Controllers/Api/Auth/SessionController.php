<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    /**
     * List all active sessions for authenticated user.
     * GET /api/v1/auth/sessions
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $sessions = ApiToken::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('last_used_at')
            ->get();

        return response()->json([
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'device_id' => $session->device_id,
                    'device_name' => $session->device_name,
                    'device_type' => $session->device_type,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'location' => $session->location,
                    'last_used_at' => $session->last_used_at?->toIso8601String(),
                    'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                    'expires_at' => $session->expires_at?->toIso8601String(),
                    'is_current' => $session->is_current,
                    'biometric_enabled' => $session->biometric_enabled,
                ];
            }),
        ]);
    }

    /**
     * Get specific session details.
     * GET /api/v1/auth/sessions/{tokenId}
     */
    public function show(Request $request, int $tokenId)
    {
        $user = Auth::user();

        $session = ApiToken::query()
            ->where('id', $tokenId)
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'Session not found.',
            ], 404);
        }

        return response()->json([
            'session' => [
                'id' => $session->id,
                'device_id' => $session->device_id,
                'device_name' => $session->device_name,
                'device_type' => $session->device_type,
                'device_fingerprint' => $session->device_fingerprint,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'location' => $session->location,
                'last_used_at' => $session->last_used_at?->toIso8601String(),
                'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                'expires_at' => $session->expires_at?->toIso8601String(),
                'refresh_expires_at' => $session->refresh_expires_at?->toIso8601String(),
                'is_current' => $session->is_current,
                'biometric_enabled' => $session->biometric_enabled,
                'created_at' => $session->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update last activity for sliding expiration.
     * POST /api/v1/auth/sessions/{tokenId}/activity
     */
    public function updateActivity(Request $request, int $tokenId)
    {
        $user = Auth::user();

        $session = ApiToken::query()
            ->where('id', $tokenId)
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'Session not found.',
            ], 404);
        }

        // Update last activity and last used timestamp
        $session->forceFill([
            'last_activity_at' => now(),
            'last_used_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Session activity updated.',
            'session' => [
                'id' => $session->id,
                'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                'expires_at' => $session->expires_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Terminate specific session.
     * DELETE /api/v1/auth/sessions/{tokenId}
     */
    public function terminate(Request $request, int $tokenId)
    {
        $user = Auth::user();

        $session = ApiToken::query()
            ->where('id', $tokenId)
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'Session not found.',
            ], 404);
        }

        // Prevent terminating the current session if it's the only one
        $currentToken = $request->bearerToken();
        $isCurrentSession = $currentToken && hash('sha256', $currentToken) === $session->token_hash;

        // Log the session termination event
        SecurityEvent::log(
            $user->id,
            SecurityEvent::EVENT_SESSION_TERMINATED,
            $request->ip(),
            $request->userAgent(),
            $session->device_id,
            $session->location,
            [
                'session_id' => $session->id,
                'device_name' => $session->device_name,
                'device_type' => $session->device_type,
                'terminated_by_user' => true,
                'was_current_session' => $isCurrentSession,
            ],
            SecurityEvent::SEVERITY_MEDIUM
        );

        // Revoke the token
        $session->forceFill([
            'revoked_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Session terminated successfully.',
        ]);
    }

    /**
     * Terminate all sessions except current.
     * DELETE /api/v1/auth/sessions/terminate-all
     */
    public function terminateAll(Request $request)
    {
        $user = Auth::user();

        // Get current token hash
        $currentToken = $request->bearerToken();
        $currentTokenHash = $currentToken ? hash('sha256', $currentToken) : null;

        // Get all active sessions except current
        $sessions = ApiToken::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->get();

        $terminatedCount = 0;

        foreach ($sessions as $session) {
            // Skip current session
            if ($currentTokenHash && $session->token_hash === $currentTokenHash) {
                continue;
            }

            // Log each session termination
            SecurityEvent::log(
                $user->id,
                SecurityEvent::EVENT_SESSION_TERMINATED,
                $request->ip(),
                $request->userAgent(),
                $session->device_id,
                $session->location,
                [
                    'session_id' => $session->id,
                    'device_name' => $session->device_name,
                    'device_type' => $session->device_type,
                    'terminated_by_user' => true,
                    'was_current_session' => false,
                    'termination_type' => 'terminate_all',
                ],
                SecurityEvent::SEVERITY_MEDIUM
            );

            // Revoke the token
            $session->forceFill([
                'revoked_at' => now(),
            ])->save();

            $terminatedCount++;
        }

        return response()->json([
            'message' => 'All other sessions terminated successfully.',
            'terminated_count' => $terminatedCount,
        ]);
    }
}
