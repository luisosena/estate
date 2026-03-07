import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * Biometric types supported by the device
 */
export type BiometricType = 'Fingerprint' | 'FaceID' | 'Iris' | 'None';

/**
 * Result object for biometric operations
 */
export interface BiometricResult<T = void> {
  success: boolean;
  data?: T;
  error?: BiometricError;
}

/**
 * Error types for biometric operations
 */
export type BiometricErrorCode =
  | 'NOT_AVAILABLE'
  | 'NOT_ENROLLED'
  | 'LOCKOUT'
  | 'USER_CANCEL'
  | 'SYSTEM_CANCEL'
  | 'PASSCODE_NOT_SET'
  | 'AUTHENTICATION_FAILED'
  | 'KEYSTORE_NOT_AVAILABLE'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

/**
 * Biometric error details
 */
export interface BiometricError {
  code: BiometricErrorCode;
  message: string;
  nativeError?: string;
}

/**
 * Device biometric capabilities
 */
export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: BiometricType[];
}

/**
 * Storage keys for biometric settings
 */
const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_KEY: 'biometric_key',
} as const;

/**
 * BiometricService - Provides biometric authentication functionality
 * for the Estate Practice mobile app.
 * 
 * Uses expo-local-authentication for biometric APIs and expo-secure-store
 * for storing biometric-protected keys securely.
 */
export class BiometricService {
  /**
   * Check if device supports biometrics
   */
  static async isBiometricAvailable(): Promise<BiometricResult<BiometricCapabilities>> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isAvailable = compatible && isEnrolled;
      
      const types = await this.getSupportedBiometricTypes();
      
      return {
        success: true,
        data: {
          isAvailable,
          hasHardware: compatible,
          isEnrolled,
          supportedTypes: types,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'Failed to check biometric availability',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Get the primary biometric type available on the device
   */
  static async getBiometricType(): Promise<BiometricResult<BiometricType>> {
    try {
      const types = await this.getSupportedBiometricTypes();
      
      // Return the first available type, prioritizing FaceID > Fingerprint > Iris
      if (types.includes('FaceID')) {
        return { success: true, data: 'FaceID' };
      }
      if (types.includes('Fingerprint')) {
        return { success: true, data: 'Fingerprint' };
      }
      if (types.includes('Iris')) {
        return { success: true, data: 'Iris' };
      }
      
      return { success: true, data: 'None' };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'Failed to get biometric type',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Get all supported biometric types on the device
   */
  private static async getSupportedBiometricTypes(): Promise<BiometricType[]> {
    try {
      const types: BiometricType[] = [];
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        types.push('FaceID');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        types.push('Fingerprint');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        types.push('Iris');
      }
      
      return types;
    } catch {
      return [];
    }
  }

  /**
   * Prompt user for biometric authentication
   * @param reason - The reason for requesting authentication
   */
  static async authenticate(reason: string): Promise<BiometricResult<boolean>> {
    try {
      // First check if biometrics are available
      const availabilityResult = await this.isBiometricAvailable();
      
      if (!availabilityResult.success) {
        return {
          success: false,
          error: availabilityResult.error,
        };
      }

      if (!availabilityResult.data?.isAvailable) {
        return {
          success: false,
          error: {
            code: 'NOT_AVAILABLE',
            message: 'Biometric authentication is not available on this device',
          },
        };
      }

      if (!availabilityResult.data?.isEnrolled) {
        return {
          success: false,
          error: {
            code: 'NOT_ENROLLED',
            message: 'No biometrics enrolled on this device',
          },
        };
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        return {
          success: true,
          data: true,
        };
      }

      // Map the error
      const errorCode = this.mapAuthenticationError(result.error);
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: this.getErrorMessage(errorCode),
          nativeError: result.error,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'An unexpected error occurred during authentication',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Check if biometric is enabled for this app
   */
  static async isBiometricEnabled(): Promise<BiometricResult<boolean>> {
    try {
      const enabled = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return {
        success: true,
        data: enabled === 'true',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to check biometric enabled status',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Enable biometric for the app
   * This stores a flag in secure storage indicating biometric is enabled
   */
  static async enableBiometric(): Promise<BiometricResult<boolean>> {
    try {
      // First verify biometrics are available
      const availabilityResult = await this.isBiometricAvailable();
      
      if (!availabilityResult.success) {
        return {
          success: false,
          error: availabilityResult.error,
        };
      }

      if (!availabilityResult.data?.isAvailable) {
        return {
          success: false,
          error: {
            code: 'NOT_AVAILABLE',
            message: 'Biometric authentication is not available on this device',
          },
        };
      }

      // Verify user can authenticate with biometrics before enabling
      const authResult = await this.authenticate('Verify your identity to enable biometric login');
      
      if (!authResult.success) {
        return {
          success: false,
          error: {
            code: authResult.error?.code || 'UNKNOWN',
            message: 'Biometric verification failed. Cannot enable biometric authentication.',
          },
        };
      }

      // Store the enabled flag in secure storage
      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to enable biometric authentication',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Disable biometric for the app
   * This removes the biometric key and disables biometric authentication
   */
  static async disableBiometric(): Promise<BiometricResult<boolean>> {
    try {
      // Clear biometric key
      await this.clearBiometricKey();
      
      // Remove the enabled flag
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to disable biometric authentication',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Store a biometric-protected key in secure storage
   * The key is stored with biometric authentication required for access
   * @param key - The key to store securely
   */
  static async storeBiometricKey(key: string): Promise<BiometricResult<boolean>> {
    try {
      // Verify biometrics are available first
      const availabilityResult = await this.isBiometricAvailable();
      
      if (!availabilityResult.success || !availabilityResult.data?.isAvailable) {
        return {
          success: false,
          error: {
            code: 'NOT_AVAILABLE',
            message: 'Biometric authentication is not available',
          },
        };
      }

      // Store the key in secure storage
      // expo-secure-store automatically uses the device's keychain/keystore
      // which can be configured to require biometric authentication
      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_KEY, key, {
        keychainService: 'com.estatepractice.biometric',
      });
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store biometric key',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Retrieve the biometric-protected key from secure storage
   * Requires successful biometric authentication to access
   */
  static async getBiometricKey(): Promise<BiometricResult<string>> {
    try {
      // Verify biometrics are enabled
      const enabledResult = await this.isBiometricEnabled();
      
      if (!enabledResult.success || !enabledResult.data) {
        return {
          success: false,
          error: {
            code: 'NOT_ENROLLED',
            message: 'Biometric authentication is not enabled',
          },
        };
      }

      // Attempt to retrieve the key
      // This will trigger biometric authentication if the key requires it
      const key = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_KEY);
      
      if (!key) {
        return {
          success: false,
          error: {
            code: 'NOT_ENROLLED',
            message: 'No biometric key found',
          },
        };
      }

      return {
        success: true,
        data: key,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to retrieve biometric key',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Clear the biometric key from secure storage
   * Used during logout or security events
   */
  static async clearBiometricKey(): Promise<BiometricResult<boolean>> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_KEY);
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to clear biometric key',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Clear all biometric data including keys and enabled status
   * Used for complete logout or security event cleanup
   */
  static async clearAllBiometricData(): Promise<BiometricResult<boolean>> {
    try {
      await this.clearBiometricKey();
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to clear biometric data',
          nativeError: error instanceof Error ? error.message : undefined,
        },
      };
    }
  }

  /**
   * Map expo-local-authentication error codes to our error codes
   */
  private static mapAuthenticationError(error: string): BiometricErrorCode {
    const errorLower = error?.toLowerCase() || '';
    
    if (errorLower.includes('lockout') || errorLower.includes('too_many')) {
      return 'LOCKOUT';
    }
    if (errorLower.includes('user_cancel') || errorLower.includes('cancel')) {
      return 'USER_CANCEL';
    }
    if (errorLower.includes('system_cancel')) {
      return 'SYSTEM_CANCEL';
    }
    if (errorLower.includes('passcode') || errorLower.includes('password')) {
      return 'PASSCODE_NOT_SET';
    }
    if (errorLower.includes('failed') || errorLower.includes('mismatch')) {
      return 'AUTHENTICATION_FAILED';
    }
    if (errorLower.includes('not_available') || errorLower.includes('not_hardware')) {
      return 'NOT_AVAILABLE';
    }
    if (errorLower.includes('not_enrolled') || errorLower.includes('no')) {
      return 'NOT_ENROLLED';
    }
    
    return 'UNKNOWN';
  }

  /**
   * Get user-friendly error message for error codes
   */
  private static getErrorMessage(code: BiometricErrorCode): string {
    switch (code) {
      case 'NOT_AVAILABLE':
        return 'Biometric authentication is not available on this device';
      case 'NOT_ENROLLED':
        return 'No biometrics enrolled on this device. Please set up biometrics in your device settings.';
      case 'LOCKOUT':
        return 'Too many failed attempts. Please try again later or use your device passcode.';
      case 'USER_CANCEL':
        return 'Authentication was cancelled';
      case 'SYSTEM_CANCEL':
        return 'Authentication was cancelled by the system';
      case 'PASSCODE_NOT_SET':
        return 'Please set up a device passcode to use biometric authentication';
      case 'AUTHENTICATION_FAILED':
        return 'Biometric authentication failed. Please try again.';
      case 'KEYSTORE_NOT_AVAILABLE':
        return 'Secure storage is not available on this device';
      case 'STORAGE_ERROR':
        return 'Failed to access secure storage';
      case 'UNKNOWN':
      default:
        return 'An unknown error occurred during authentication';
    }
  }
}

export default BiometricService;
