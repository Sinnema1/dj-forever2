// Enhanced Offline Service for Wedding Website PWA
import { logInfo, logError } from '../utils/logger';
import { reportError } from './errorReportingService';

export interface OfflineData {
  weddingDetails: any;
  guestInfo: any;
  cachedImages: string[];
  rsvpDrafts: any[];
  photoUploads: any[];
  lastSync: number;
}

export interface PendingRSVP {
  id: string;
  fullName: string;
  attending: 'YES' | 'NO' | 'MAYBE';
  mealPreference: string;
  allergies: string;
  additionalNotes: string;
  timestamp: number;
}

export interface PendingPhotoUpload {
  id: string;
  file: File;
  caption: string;
  guestName: string;
  timestamp: number;
}

class OfflineService {
  private dbName = 'WeddingWebsiteDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Store for wedding details and static content
        if (!db.objectStoreNames.contains('weddingData')) {
          db.createObjectStore('weddingData', { keyPath: 'id' });
        }

        // Store for pending RSVP submissions
        if (!db.objectStoreNames.contains('pendingRSVPs')) {
          db.createObjectStore('pendingRSVPs', { keyPath: 'id' });
        }

        // Store for pending photo uploads
        if (!db.objectStoreNames.contains('pendingPhotos')) {
          db.createObjectStore('pendingPhotos', { keyPath: 'id' });
        }

        // Store for cached images
        if (!db.objectStoreNames.contains('cachedImages')) {
          db.createObjectStore('cachedImages', { keyPath: 'url' });
        }
      };
    });
  }

  async saveWeddingData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['weddingData'], 'readwrite');
      const store = transaction.objectStore('weddingData');

      const request = store.put({
        id: key,
        data,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getWeddingData(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['weddingData'], 'readonly');
      const store = transaction.objectStore('weddingData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // RSVP Management for Offline
  async savePendingRSVP(rsvp: PendingRSVP): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRSVPs'], 'readwrite');
      const store = transaction.objectStore('pendingRSVPs');

      const request = store.put(rsvp);
      request.onsuccess = () => {
        resolve();
        // Try to sync immediately if online
        if (navigator.onLine) {
          this.syncPendingRSVPs();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingRSVPs(): Promise<PendingRSVP[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRSVPs'], 'readonly');
      const store = transaction.objectStore('pendingRSVPs');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePendingRSVP(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRSVPs'], 'readwrite');
      const store = transaction.objectStore('pendingRSVPs');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Photo Upload Management for Offline
  async savePendingPhoto(photo: PendingPhotoUpload): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingPhotos'], 'readwrite');
      const store = transaction.objectStore('pendingPhotos');

      const request = store.put(photo);
      request.onsuccess = () => {
        resolve();
        // Try to sync immediately if online
        if (navigator.onLine) {
          this.syncPendingPhotos();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingPhotos(): Promise<PendingPhotoUpload[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingPhotos'], 'readonly');
      const store = transaction.objectStore('pendingPhotos');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePendingPhoto(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingPhotos'], 'readwrite');
      const store = transaction.objectStore('pendingPhotos');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Image Caching
  async cacheImage(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedImages'], 'readwrite');
      const store = transaction.objectStore('cachedImages');

      const request = store.put({
        url,
        blob,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedImage(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedImages'], 'readonly');
      const store = transaction.objectStore('cachedImages');
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.blob || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Functions
  async syncPendingRSVPs(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingRSVPs = await this.getPendingRSVPs();

    for (const rsvp of pendingRSVPs) {
      try {
        // This would call your GraphQL mutation
        await this.submitRSVPToServer(rsvp);
        await this.deletePendingRSVP(rsvp.id);

        // Show success notification
        this.showSyncNotification('RSVP synced successfully!');
      } catch (error) {
        logError('Failed to sync RSVP', 'OfflineService', error);
        reportError(error as Error, {
          component: 'OfflineService',
          action: 'sync_rsvp',
          rsvpId: rsvp.id,
        });
        // Keep in queue for next sync attempt
      }
    }
  }

  async syncPendingPhotos(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingPhotos = await this.getPendingPhotos();

    for (const photo of pendingPhotos) {
      try {
        // This would call your photo upload API
        await this.uploadPhotoToServer(photo);
        await this.deletePendingPhoto(photo.id);

        // Show success notification
        this.showSyncNotification('Photo uploaded successfully!');
      } catch (error) {
        logError('Failed to sync photo', 'OfflineService', error);
        reportError(error as Error, {
          component: 'OfflineService',
          action: 'sync_photo',
          photoId: photo.id,
        });
        // Keep in queue for next sync attempt
      }
    }
  }

  // Network Status Management
  setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.onNetworkOnline();
    });

    window.addEventListener('offline', () => {
      this.onNetworkOffline();
    });
  }

  private async onNetworkOnline(): Promise<void> {
    logInfo('Network came back online, syncing pending data', 'OfflineService');

    // Show reconnection notification
    this.showSyncNotification('Back online! Syncing your data...');

    // Sync all pending data
    await Promise.all([this.syncPendingRSVPs(), this.syncPendingPhotos()]);
  }

  private onNetworkOffline(): void {
    logInfo('Network went offline, entering offline mode', 'OfflineService');
    this.showSyncNotification(
      "You're now offline. Changes will sync when you reconnect."
    );
  }

  // Utility Methods
  private async submitRSVPToServer(rsvp: PendingRSVP): Promise<void> {
    // This would integrate with your existing GraphQL mutation
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation SubmitRSVP($input: RSVPInput!) {
            submitRSVP(input: $input) {
              id
              fullName
              attending
            }
          }
        `,
        variables: {
          input: {
            fullName: rsvp.fullName,
            attending: rsvp.attending,
            mealPreference: rsvp.mealPreference,
            allergies: rsvp.allergies,
            additionalNotes: rsvp.additionalNotes,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit RSVP');
    }
  }

  private async uploadPhotoToServer(photo: PendingPhotoUpload): Promise<void> {
    // This would integrate with your photo upload endpoint
    const formData = new FormData();
    formData.append('photo', photo.file);
    formData.append('caption', photo.caption);
    formData.append('guestName', photo.guestName);

    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }
  }

  private showSyncNotification(message: string): void {
    // This could integrate with your notification system
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Wedding Website', {
        body: message,
        icon: '/favicon.svg',
      });
    }

    // You could also show an in-app notification
    logInfo('Sync notification', 'OfflineService', { message });
  }

  // Status Check
  async getOfflineStatus(): Promise<{
    isOnline: boolean;
    pendingRSVPs: number;
    pendingPhotos: number;
    lastSync: number;
  }> {
    const pendingRSVPs = await this.getPendingRSVPs();
    const pendingPhotos = await this.getPendingPhotos();

    return {
      isOnline: navigator.onLine,
      pendingRSVPs: pendingRSVPs.length,
      pendingPhotos: pendingPhotos.length,
      lastSync: Date.now(), // This would be stored and retrieved from IndexedDB
    };
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

// Initialize on app start
if (typeof window !== 'undefined') {
  offlineService.init().then(() => {
    offlineService.setupNetworkListeners();
  });
}
