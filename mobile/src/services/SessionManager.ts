import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { getItem, setItem, deleteItem } from '../utils/storage';
import api from '../api/client';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'phone' | 'tablet' | 'desktop' | 'unknown';
  deviceFingerprint: string;
}

export interface Session {
  token: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
  deviceInfo: DeviceInfo;
  lastActivityAt: number; // Unix timestamp in milliseconds
  userId?: number;
  userEmail?: string;
}

export interface SessionManagerConfig {
  tokenExpiryBufferMs?: number; // Refresh token this many ms before expiry
  sessionExpiryMs?: number; // Session expiry time (sliding window)
  refreshThresholdMs?: number; // Auto-refresh if token expires within this time
}

// ──────────────────────────────────────────
// Storage Keys
// ──────────────────────────────────────────

const STORAGE_KEYS = {
  SESSION: 'session',
  DEVICE_ID: 'device_id',
  DEVICE_NAME: 'device_name',
  DEVICE_TYPE: 'device_type',
  DEVICE_FINGERPRINT: 'device_fingerprint',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  LAST_ACTIVITY_AT: 'last_activity_at',
} as const;

// ──────────────────────────────────────────
// Token Refresh Response
// ──────────────────────────────────────────

interface TokenRefreshResponse {
  token: string;
  refresh_token?: string;
  expires_in?: number; // Seconds until expiry
}

// ──────────────────────────────────────────
// SessionManager Class
// ──────────────────────────────────────────

class SessionManager {
  private config: Required<SessionManagerConfig>;
  private isInitialized = false;
  private deviceInfo: DeviceInfo | null = null;

  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      tokenExpiryBufferMs: config.tokenExpiryBufferMs ?? 5 * 60 * 1000, // 5 minutes
      sessionExpiryMs: config.sessionExpiryMs ?? 24 * 60 * 60 * 1000, // 24 hours
      refreshThresholdMs: config.refreshThresholdMs ?? 10 * 60 * 1000, // 10 minutes
    };
  }

  // ──────────────────────────────────────────
  // Device Info Generation
  // ──────────────────────────────────────────

  /**
   * Generate a SHA-256 hash of the given string for device fingerprinting
   */
  private async generateFingerprint(data: string): Promise<string> {
    // Use expo-crypto for proper SHA-256 hashing
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  }

  /**
   * Collect device information for fingerprinting
   */
  private async collectDeviceData(): Promise<string> {
    const deviceId = await this.getOrCreateDeviceId();
    const deviceName = Device.deviceName ?? 'Unknown Device';
    const deviceType = this.getDeviceType();
    const modelName = Device.modelName ?? 'Unknown';
    const brand = Device.brand ?? 'Unknown';
    const osVersion = Device.osVersion ?? 'Unknown';
    
    return `${deviceId}|${deviceName}|${deviceType}|${modelName}|${brand}|${osVersion}|${Platform.OS}`;
  }

  /**
   * Get or create a persistent device ID
   */
  private async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await getItem(STORAGE_KEYS.DEVICE_ID);
    
    if (!deviceId) {
      deviceId = uuidv4();
      await setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  }

  /**
   * Determine device type from expo-device
   */
  private getDeviceType(): 'phone' | 'tablet' | 'desktop' | 'unknown' {
    if (!Device.deviceType) {
      return 'unknown';
    }

    switch (Device.deviceType) {
      case Device.DeviceType.PHONE:
        return 'phone';
      case Device.DeviceType.TABLET:
        return 'tablet';
      case Device.DeviceType.DESKTOP:
        return 'desktop';
      default:
        return 'unknown';
    }
  }

  /**
   * Initialize and collect device information
   */
  private async initializeDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const deviceId = await this.getOrCreateDeviceId();
    const deviceName = Device.deviceName ?? 'Unknown Device';
    const deviceType = this.getDeviceType();
    const deviceData = await this.collectDeviceData();
    const deviceFingerprint = await this.generateFingerprint(deviceData);

    this.deviceInfo = {
      deviceId,
      deviceName,
      deviceType,
      deviceFingerprint,
    };

    // Store device info
    await setItem(STORAGE_KEYS.DEVICE_NAME, deviceName);
    await setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
    await setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, deviceFingerprint);

    return this.deviceInfo;
  }

  // ──────────────────────────────────────────
  // Public Methods
  // ──────────────────────────────────────────

  /**
   * Initialize the session manager with device information
   */
  async initialize(): Promise<DeviceInfo> {
    if (this.isInitialized) {
      return this.deviceInfo!;
    }

    try {
      this.deviceInfo = await this.initializeDeviceInfo();
      this.isInitialized = true;
      return this.deviceInfo;
    } catch (error) {
      console.error('[SessionManager] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Create a new session with the provided tokens
   */
  async createSession(
    token: string,
    refreshToken: string,
    expiresInSeconds: number = 3600, // Default 1 hour
    userId?: number,
    userEmail?: string
  ): Promise<Session> {
    try {
      const deviceInfo = await this.initialize();
      const now = Date.now();
      
      const session: Session = {
        token,
        refreshToken,
        expiresAt: now + (expiresInSeconds * 1000),
        deviceInfo,
        lastActivityAt: now,
        userId,
        userEmail,
      };

      // Store session data
      await setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, session.expiresAt.toString());
      await setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, session.lastActivityAt.toString());
      
      // Store tokens securely
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('refresh_token', refreshToken);

      // Store full session as JSON (non-sensitive parts)
      const sessionData = {
        deviceInfo,
        lastActivityAt: session.lastActivityAt,
        userId,
        userEmail,
      };
      await setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      console.log('[SessionManager] Session created successfully');
      return session;
    } catch (error) {
      console.error('[SessionManager] Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get the current stored session
   */
  async getSession(): Promise<Session | null> {
    try {
      const [token, refreshToken, expiresAtStr, lastActivityStr, sessionDataStr] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('refresh_token'),
        getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT),
        getItem(STORAGE_KEYS.LAST_ACTIVITY_AT),
        getItem(STORAGE_KEYS.SESSION),
      ]);

      if (!token || !refreshToken) {
        return null;
      }

      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : Date.now() + 3600000;
      const lastActivityAt = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();

      let deviceInfo: DeviceInfo;
      let userId: number | undefined;
      let userEmail: string | undefined;

      if (sessionDataStr) {
        const parsed = JSON.parse(sessionDataStr);
        deviceInfo = parsed.deviceInfo;
        userId = parsed.userId;
        userEmail = parsed.userEmail;
      } else {
        // Fallback to stored device info
        const [deviceId, deviceName, deviceType, fingerprint] = await Promise.all([
          getItem(STORAGE_KEYS.DEVICE_ID),
          getItem(STORAGE_KEYS.DEVICE_NAME),
          getItem(STORAGE_KEYS.DEVICE_TYPE),
          getItem(STORAGE_KEYS.DEVICE_FINGERPRINT),
        ]);

        deviceInfo = {
          deviceId: deviceId ?? uuidv4(),
          deviceName: deviceName ?? 'Unknown',
          deviceType: (deviceType as DeviceInfo['deviceType']) ?? 'unknown',
          deviceFingerprint: fingerprint ?? '',
        };
      }

      return {
        token,
        refreshToken,
        expiresAt,
        deviceInfo,
        lastActivityAt,
        userId,
        userEmail,
      };
    } catch (error) {
      console.error('[SessionManager] Failed to get session:', error);
      return null;
    }
  }

  /**
   * Clear the stored session (logout)
   */
  async clearSession(): Promise<void> {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');

      // Clear other session data
      await Promise.all([
        deleteItem(STORAGE_KEYS.SESSION),
        deleteItem(STORAGE_KEYS.TOKEN_EXPIRES_AT),
        deleteItem(STORAGE_KEYS.LAST_ACTIVITY_AT),
      ]);

      // Clear device info (optional - keep for device tracking)
      // await Promise.all([
      //   deleteItem(STORAGE_KEYS.DEVICE_ID),
      //   deleteItem(STORAGE_KEYS.DEVICE_NAME),
      //   deleteItem(STORAGE_KEYS.DEVICE_TYPE),
      //   deleteItem(STORAGE_KEYS.DEVICE_FINGERPRINT),
      // ]);

      this.deviceInfo = null;
      console.log('[SessionManager] Session cleared successfully');
    } catch (error) {
      console.error('[SessionManager] Failed to clear session:', error);
      throw error;
    }
  }

  /**
   * Update the last activity timestamp (for sliding expiration)
   */
  async updateActivity(): Promise<void> {
    try {
      const now = Date.now();
      await setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, now.toString());
      
      // Also update the session in storage
      const sessionDataStr = await getItem(STORAGE_KEYS.SESSION);
      if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivityAt = now;
        await setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('[SessionManager] Failed to update activity:', error);
    }
  }

  /**
   * Check if the session is still valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getSession();
      
      if (!session) {
        return false;
      }

      const now = Date.now();

      // Check if token is expired
      if (now >= session.expiresAt) {
        console.log('[SessionManager] Session invalid: Token expired');
        return false;
      }

      // Check sliding window expiration
      const lastActivity = session.lastActivityAt;
      if (now - lastActivity > this.config.sessionExpiryMs) {
        console.log('[SessionManager] Session invalid: Sliding window expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SessionManager] Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Check if the token is about to expire and needs refreshing
   */
  private async isTokenExpiringSoon(): Promise<boolean> {
    try {
      const expiresAtStr = await getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
      if (!expiresAtStr) {
        return true; // No expiry info, assume needs refresh
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      return timeUntilExpiry < this.config.refreshThresholdMs;
    } catch {
      return true;
    }
  }

  /**
   * Refresh the session token if needed
   */
  async refreshSessionIfNeeded(): Promise<boolean> {
    try {
      // First check if session is valid at all
      const isValid = await this.isSessionValid();
      if (!isValid) {
        console.log('[SessionManager] Session not valid, cannot refresh');
        return false;
      }

      // Check if token is expiring soon
      const shouldRefresh = await this.isTokenExpiringSoon();
      if (!shouldRefresh) {
        console.log('[SessionManager] Token not expiring soon, no refresh needed');
        return true;
      }

      console.log('[SessionManager] Token expiring soon, refreshing...');

      // Get refresh token
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        console.log('[SessionManager] No refresh token available');
        return false;
      }

      // Make refresh request
      const response = await api.post<TokenRefreshResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { token, refresh_token, expires_in } = response;
      
      // Calculate new expiry
      const expiresInSeconds = expires_in ?? 3600;
      const newExpiresAt = Date.now() + (expiresInSeconds * 1000);

      // Update stored tokens
      await SecureStore.setItemAsync('auth_token', token);
      if (refresh_token) {
        await SecureStore.setItemAsync('refresh_token', refresh_token);
      }
      await setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, newExpiresAt.toString());

      // Update activity timestamp
      await this.updateActivity();

      console.log('[SessionManager] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[SessionManager] Failed to refresh session:', error);
      
      // Check if it's a network error vs auth error
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Refresh token is invalid, clear session
        console.log('[SessionManager] Refresh token invalid, clearing session');
        await this.clearSession();
      }
      
      return false;
    }
  }

  /**
   * Get the current access token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('[SessionManager] Failed to get token:', error);
      return null;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.deviceInfo;
  }

  /**
   * Get time until token expiry
   */
  async getTimeUntilExpiry(): Promise<number> {
    try {
      const expiresAtStr = await getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
      if (!expiresAtStr) {
        return 0;
      }
      return Math.max(0, parseInt(expiresAtStr, 10) - Date.now());
    } catch {
      return 0;
    }
  }

  /**
   * Get time since last activity
   */
  async getTimeSinceLastActivity(): Promise<number> {
    try {
      const lastActivityStr = await getItem(STORAGE_KEYS.LAST_ACTIVITY_AT);
      if (!lastActivityStr) {
        return 0;
      }
      return Date.now() - parseInt(lastActivityStr, 10);
    } catch {
      return 0;
    }
  }
}

// ──────────────────────────────────────────
// Singleton Instance
// ──────────────────────────────────────────

export const sessionManager = new SessionManager();

// ──────────────────────────────────────────
// Export
// ──────────────────────────────────────────

export default sessionManager;
