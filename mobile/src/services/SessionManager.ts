import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { getItem, setItem, deleteItem } from '../utils/storage';

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
  deviceInfo: DeviceInfo;
  lastActivityAt: number; // Unix timestamp in milliseconds
  userId?: number;
  userEmail?: string;
}

export interface SessionManagerConfig {
  sessionExpiryMs?: number; // Session inactivity timeout (sliding window)
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
  LAST_ACTIVITY_AT: 'last_activity_at',
} as const;

// ──────────────────────────────────────────
// SessionManager Class
// ──────────────────────────────────────────

class SessionManager {
  private config: Required<SessionManagerConfig>;
  private isInitialized = false;
  private deviceInfo: DeviceInfo | null = null;

  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      sessionExpiryMs: config.sessionExpiryMs ?? 30 * 24 * 60 * 60 * 1000, // 30 days default inactivity
    };
  }

  // ──────────────────────────────────────────
  // Device Info Generation
  // ──────────────────────────────────────────

  private async generateFingerprint(data: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  }

  private async collectDeviceData(): Promise<string> {
    const deviceId = await this.getOrCreateDeviceId();
    const deviceName = Device.deviceName ?? 'Unknown Device';
    const deviceType = this.getDeviceType();
    const modelName = Device.modelName ?? 'Unknown';
    const brand = Device.brand ?? 'Unknown';
    const osVersion = Device.osVersion ?? 'Unknown';
    
    return `${deviceId}|${deviceName}|${deviceType}|${modelName}|${brand}|${osVersion}|${Platform.OS}`;
  }

  private async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await getItem(STORAGE_KEYS.DEVICE_ID);
    
    if (!deviceId) {
      deviceId = uuidv4();
      await setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  }

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

    await setItem(STORAGE_KEYS.DEVICE_NAME, deviceName);
    await setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
    await setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, deviceFingerprint);

    return this.deviceInfo;
  }

  // ──────────────────────────────────────────
  // Public Methods
  // ──────────────────────────────────────────

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

  async createSession(
    token: string,
    userId?: number,
    userEmail?: string
  ): Promise<Session> {
    try {
      const deviceInfo = await this.initialize();
      const now = Date.now();
      
      const session: Session = {
        token,
        deviceInfo,
        lastActivityAt: now,
        userId,
        userEmail,
      };

      await setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, session.lastActivityAt.toString());
      await SecureStore.setItemAsync('auth_token', token);

      const sessionData = {
        deviceInfo,
        lastActivityAt: session.lastActivityAt,
        userId,
        userEmail,
      };
      await setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      return session;
    } catch (error) {
      console.error('[SessionManager] Failed to create session:', error);
      throw error;
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const [token, lastActivityStr, sessionDataStr] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        getItem(STORAGE_KEYS.LAST_ACTIVITY_AT),
        getItem(STORAGE_KEYS.SESSION),
      ]);

      if (!token) {
        return null;
      }

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

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');

      await Promise.all([
        deleteItem(STORAGE_KEYS.SESSION),
        deleteItem(STORAGE_KEYS.LAST_ACTIVITY_AT),
      ]);

      this.deviceInfo = null;
    } catch (error) {
      console.error('[SessionManager] Failed to clear session:', error);
      throw error;
    }
  }

  async updateActivity(): Promise<void> {
    try {
      const now = Date.now();
      await setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, now.toString());
      
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

  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getSession();
      
      if (!session) {
        return false;
      }

      const now = Date.now();
      const lastActivity = session.lastActivityAt;
      
      // Secondary check: sliding window logic for local device security
      if (now - lastActivity > this.config.sessionExpiryMs) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SessionManager] Failed to validate session:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('[SessionManager] Failed to get token:', error);
      return null;
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.deviceInfo;
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
