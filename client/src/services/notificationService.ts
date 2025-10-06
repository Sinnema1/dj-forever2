/**
 * @fileoverview Push notification service for wedding website updates
 *
 * Comprehensive notification management system for wedding-specific events
 * with VAPID push notifications, permission handling, and seamless integration
 * with service workers. Provides real-time updates for weather, schedule changes,
 * RSVP reminders, and photo gallery additions.
 *
 * Features:
 * - VAPID push notification registration and management
 * - Wedding-specific notification templates and categories
 * - Intelligent permission requesting with graceful fallbacks
 * - Service worker integration for background notifications
 * - Subscription management with backend synchronization
 * - Local notification display with custom branding
 * - Error tracking and analytics integration
 *
 * @module WeddingNotificationService
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { notificationService, WeddingNotifications } from './services/notificationService';
 *
 * // Request notification permission
 * const hasPermission = await notificationService.requestPermission();
 *
 * // Subscribe to push notifications
 * if (hasPermission) {
 *   await notificationService.subscribeToPushNotifications();
 * }
 *
 * // Show immediate notification
 * notificationService.showNotification(
 *   WeddingNotifications.WEATHER_UPDATE.title,
 *   { body: WeddingNotifications.WEATHER_UPDATE.body }
 * );
 * ```
 *
 * @see {@link https://web.dev/push-notifications/} Push notifications guide
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Push_API} Push API reference
 */

import { logWarn, logError } from '../utils/logger';
import { reportError, reportNetworkError } from './errorReportingService';

/**
 * Singleton notification service for wedding website updates
 *
 * Manages push notification subscriptions, permission requests, and
 * wedding-specific notification delivery with comprehensive error handling
 * and analytics integration for optimal user engagement.
 *
 * @class WeddingNotificationService
 * @version 2.0.0
 *
 * @example
 * ```typescript
 * // Get singleton instance
 * const notifications = WeddingNotificationService.getInstance();
 *
 * // Setup push notifications
 * const success = await notifications.subscribeToPushNotifications();
 * if (success) {
 *   console.log('Push notifications enabled');
 * }
 *
 * // Send immediate notification
 * notifications.showNotification('RSVP Reminder', {
 *   body: "Don't forget to submit your RSVP!",
 *   badge: '/favicon.svg',
 *   actions: [{ action: 'rsvp', title: 'RSVP Now' }]
 * });
 * ```
 */
class WeddingNotificationService {
  /** Singleton instance for notification service */
  private static instance: WeddingNotificationService;
  /** VAPID public key for push notification subscription */
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  /**
   * Get singleton instance of notification service
   * @returns The shared notification service instance
   *
   * @example
   * ```typescript
   * const service = WeddingNotificationService.getInstance();
   * await service.requestPermission();
   * ```
   */
  static getInstance(): WeddingNotificationService {
    if (!WeddingNotificationService.instance) {
      WeddingNotificationService.instance = new WeddingNotificationService();
    }
    return WeddingNotificationService.instance;
  }

  /**
   * Request notification permission from user with graceful handling
   * Checks browser support and current permission status before requesting
   * @returns Promise resolving to true if permission granted
   *
   * @example
   * ```typescript
   * const canNotify = await notificationService.requestPermission();
   * if (canNotify) {
   *   console.log('Notifications enabled');
   * } else {
   *   console.log('Notifications blocked or unsupported');
   * }
   * ```
   */
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

  /**
   * Subscribe to push notifications with VAPID authentication
   * Handles service worker registration, subscription creation, and backend sync
   * @returns Promise resolving to true if subscription successful
   *
   * @example
   * ```typescript
   * const subscribed = await notificationService.subscribeToPushNotifications();
   * if (subscribed) {
   *   // User will receive wedding updates
   *   analytics.track('push_notifications_enabled');
   * }
   * ```
   */
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

  /**
   * Display local notification with wedding branding
   * Shows immediate notification if permission granted
   * @param title - Notification title
   * @param options - Additional notification options
   *
   * @example
   * ```typescript
   * // Show weather update
   * notificationService.showNotification(
   *   '🌤️ Weather Update',
   *   {
   *     body: 'Sunny skies expected for the wedding!',
   *     tag: 'weather-update',
   *     requireInteraction: true
   *   }
   * );
   * ```
   */
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

/**
 * Pre-defined wedding notification templates
 *
 * Standardized notification content for common wedding website events
 * with consistent branding, emojis, and messaging tone.
 *
 * @example
 * ```typescript
 * // Use template for RSVP reminder
 * notificationService.showNotification(
 *   WeddingNotifications.RSVP_REMINDER.title,
 *   { body: WeddingNotifications.RSVP_REMINDER.body }
 * );
 *
 * // Customize template content
 * notificationService.showNotification(
 *   WeddingNotifications.SCHEDULE_CHANGE.title,
 *   {
 *     body: 'Ceremony moved to 3:30 PM due to weather',
 *     tag: 'schedule-change',
 *     requireInteraction: true
 *   }
 * );
 * ```
 */
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
