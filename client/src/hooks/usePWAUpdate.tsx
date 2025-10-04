import { useState, useEffect } from 'react';
import { logInfo, logWarn, logError } from '../utils/logger';
import { notificationService } from '../services/notificationService';

interface PWAUpdateState {
  updateAvailable: boolean;
  installing: boolean;
  skipWaiting: boolean;
  newServiceWorker: ServiceWorker | null;
}

/**
 * Enhanced PWA Update Hook
 *
 * Manages Progressive Web App updates and service worker lifecycle.
 * Provides seamless update experience for wedding website visitors.
 *
 * @returns PWA update state and control functions
 *
 * @example
 * ```tsx
 * function UpdateNotification() {
 *   const { updateAvailable, handleUpdate, isInstalling } = usePWAUpdate();
 *
 *   if (!updateAvailable) return null;
 *
 *   return (
 *     <div className="update-banner">
 *       <p>New version available!</p>
 *       <button onClick={handleUpdate} disabled={isInstalling}>
 *         {isInstalling ? 'Updating...' : 'Update Now'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePWAUpdate() {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    installing: false,
    skipWaiting: false,
    newServiceWorker: null,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      logWarn('Service Worker not supported', 'PWAUpdate');
      return;
    }

    const handleServiceWorkerUpdate = async (): Promise<
      (() => void) | undefined
    > => {
      try {
        if (!('serviceWorker' in navigator)) return undefined;

        const registration = await navigator.serviceWorker.ready;

        // Check for updates periodically
        const checkForUpdates = () => {
          if (registration) {
            registration.update();
          }
        };

        // Check for updates every 60 seconds when app is visible
        let updateInterval: NodeJS.Timeout;

        const startUpdateChecking = () => {
          updateInterval = setInterval(checkForUpdates, 60000);
        };

        const stopUpdateChecking = () => {
          if (updateInterval) {
            clearInterval(updateInterval);
          }
        };

        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkForUpdates();
            startUpdateChecking();
          } else {
            stopUpdateChecking();
          }
        });

        // Start checking if page is visible
        if (document.visibilityState === 'visible') {
          startUpdateChecking();
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          logInfo('New service worker found, installing', 'PWAUpdate');

          setState(prev => ({
            ...prev,
            installing: true,
            newServiceWorker: newWorker,
          }));

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                logInfo(
                  'New service worker installed, update available',
                  'PWAUpdate'
                );

                setState(prev => ({
                  ...prev,
                  updateAvailable: true,
                  installing: false,
                }));

                // Show update notification
                notificationService.showNotification('🔄 Update Available', {
                  body: 'A new version of the wedding website is ready!',
                  tag: 'pwa-update',
                  requireInteraction: true,
                });
              } else {
                // First install
                logInfo(
                  'Service worker installed for the first time',
                  'PWAUpdate'
                );
                setState(prev => ({ ...prev, installing: false }));
              }
            }
          });
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data?.type === 'SKIP_WAITING') {
            setState(prev => ({ ...prev, skipWaiting: true }));
          }
        });

        // Cleanup function
        return () => {
          stopUpdateChecking();
        };
      } catch (error) {
        logError(
          'Failed to setup service worker update handling',
          'PWAUpdate',
          error
        );
        return undefined;
      }
    };

    handleServiceWorkerUpdate();
  }, []);

  const handleUpdate = async () => {
    if (!state.newServiceWorker) {
      logWarn('No new service worker available for update', 'PWAUpdate');
      return;
    }

    try {
      setState(prev => ({ ...prev, installing: true }));

      // Tell the new service worker to skip waiting
      state.newServiceWorker.postMessage({ type: 'SKIP_WAITING' });

      // Wait for the new service worker to take control
      await new Promise<void>(resolve => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            handleControllerChange
          );
          resolve();
        };

        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange
        );
      });

      logInfo('Service worker updated successfully', 'PWAUpdate');

      // Reload the page to get the latest version
      window.location.reload();
    } catch (error) {
      logError('Failed to update service worker', 'PWAUpdate', error);
      setState(prev => ({ ...prev, installing: false }));
    }
  };

  const dismissUpdate = () => {
    setState(prev => ({
      ...prev,
      updateAvailable: false,
      newServiceWorker: null,
    }));

    // Don't show again this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  const shouldShowUpdate = () => {
    // Don't show if dismissed this session
    if (sessionStorage.getItem('pwa-update-dismissed')) return false;

    // Only show if update is available
    return state.updateAvailable;
  };

  return {
    ...state,
    handleUpdate,
    dismissUpdate,
    shouldShowUpdate: shouldShowUpdate(),
  };
}

/**
 * PWA Update Banner Component
 *
 * Displays update notification when new version is available
 */
export function PWAUpdateBanner() {
  const { shouldShowUpdate, handleUpdate, dismissUpdate, installing } =
    usePWAUpdate();

  if (!shouldShowUpdate) return null;

  return (
    <div className="pwa-update-banner">
      <div className="update-content">
        <div className="update-icon">🔄</div>
        <div className="update-text">
          <h3>Update Available</h3>
          <p>A new version with improvements is ready!</p>
        </div>
        <div className="update-actions">
          <button
            onClick={handleUpdate}
            disabled={installing}
            className="update-btn update-btn-primary"
          >
            {installing ? 'Updating...' : 'Update Now'}
          </button>
          <button
            onClick={dismissUpdate}
            className="update-btn update-btn-secondary"
            disabled={installing}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PWA Update Toast Component
 *
 * Subtle toast notification for updates
 */
export function PWAUpdateToast() {
  const { shouldShowUpdate, handleUpdate, dismissUpdate, installing } =
    usePWAUpdate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShowUpdate) {
      // Delay showing toast slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      return undefined;
    }
  }, [shouldShowUpdate]);

  if (!isVisible) return null;

  return (
    <div className="pwa-update-toast">
      <div className="toast-content">
        <div className="toast-icon">✨</div>
        <div className="toast-text">
          <p>New version available!</p>
        </div>
        <div className="toast-actions">
          <button
            onClick={handleUpdate}
            disabled={installing}
            className="toast-btn toast-btn-primary"
            title="Update to latest version"
          >
            {installing ? '⟳' : '↗'}
          </button>
          <button
            onClick={dismissUpdate}
            className="toast-btn toast-btn-secondary"
            disabled={installing}
            title="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
