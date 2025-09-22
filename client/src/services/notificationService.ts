// Push Notification Service for Wedding Updates
import { logWarn, logError } from '../utils/logger';
import { reportError, reportNetworkError } from './errorReportingService';

class WeddingNotificationService {
  private static instance: WeddingNotificationService;
  private vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;

  static getInstance(): WeddingNotificationService {
    if (!WeddingNotificationService.instance) {
      WeddingNotificationService.instance = new WeddingNotificationService();
    }
    return WeddingNotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      logWarn(
        'This browser does not support notifications',
        'NotificationService'
      );
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async subscribeToPushNotifications(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return false;

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey!),
      });

      // Send subscription to your backend
      await this.sendSubscriptionToServer(subscription);

      return true;
    } catch (error) {
      logError(
        'Failed to subscribe to push notifications',
        'NotificationService',
        error
      );
      reportError(error as Error, {
        component: 'NotificationService',
        action: 'subscribe_push',
      });
      return false;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    // Send to your GraphQL backend
    const response = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const error = new Error('Failed to save push subscription');
      reportNetworkError(error, '/api/push/subscribe', 'POST');
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    // Return as BufferSource to match PushManager.subscribe requirements
    return outputArray;
  }

  // Show local notification (for immediate updates)
  showNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });
    }
  }
}

export const notificationService = WeddingNotificationService.getInstance();

// Wedding-specific notification types
export const WeddingNotifications = {
  WEATHER_UPDATE: {
    title: '🌤️ Weather Update',
    body: 'Check the latest weather forecast for the wedding day!',
  },
  SCHEDULE_CHANGE: {
    title: '⏰ Schedule Update',
    body: "There's been a change to the wedding timeline.",
  },
  RSVP_REMINDER: {
    title: '💌 RSVP Reminder',
    body: "Don't forget to submit your RSVP!",
  },
  PHOTO_GALLERY: {
    title: '📸 New Photos',
    body: 'New photos have been added to the gallery!',
  },
};
