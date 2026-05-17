import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private pushToken: string | null = null;

  async requestPermissionsAndRegister(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permissions not granted');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = tokenData.data;
      await this.registerTokenWithBackend(tokenData.data);

      return tokenData.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await api.post('/users/push-token', {
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Failed to register push token with backend:', error);
    }
  }

  async unregisterToken(): Promise<void> {
    try {
      await api.delete('/users/push-token');
      this.pushToken = null;
    } catch (error) {
      console.error('Failed to unregister push token:', error);
    }
  }

  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ) {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

    return {
      unsubscribe: () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      },
    };
  }

  async sendLocalNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  }

  getPushToken(): string | null {
    return this.pushToken;
  }
}

export const pushNotificationService = new PushNotificationService();
