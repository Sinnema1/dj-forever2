/**
 * PWA Update Management Hook
 *
 * Comprehensive Progressive Web App update system for the DJ Forever 2 wedding
 * website. Manages service worker lifecycle, automatic update detection, and
 * provides seamless update experience for wedding guests without interrupting
 * their browsing experience.
 *
 * @fileoverview PWA update hook with seamless user experience
 * @version 2.0
 * @since 1.0.0
 *
 * @features
 * - **Automatic Update Detection**: Monitors for new app versions
 * - **Seamless Updates**: Non-disruptive update process
 * - **User Control**: Optional manual update triggers
 * - **Background Updates**: Updates downloaded in background
 * - **Update Notifications**: Elegant user notifications for updates
 * - **Rollback Support**: Handles update failures gracefully
 */
/* eslint-disable react-refresh/only-export-components */
// This file exports both usePWAUpdate hook and PWA update UI components - a cohesive PWA module

import { useState, useEffect } from 'react';
import { logInfo, logWarn, logError } from '../utils/logger';
import { notificationService } from '../services/notificationService';

/**
 * PWA update state interface
 *
 * @interface PWAUpdateState
 */
interface PWAUpdateState {
  /** Whether a new version is available for installation */
  updateAvailable: boolean;
  /** Whether an update installation is currently in progress */
  installing: boolean;
  /** Whether to skip waiting for existing clients to close */
  skipWaiting: boolean;
  /** Reference to the new service worker ready to activate */
  newServiceWorker: ServiceWorker | null;
}

/**
 * usePWAUpdate - Progressive Web App Update Hook
 *
 * Manages the complete PWA update lifecycle including update detection, download,
 * installation, and activation. Provides wedding guests with seamless access to
 * the latest features and bug fixes without disrupting their current session.
 *
 * @hook
 * @returns {Object} PWA update utilities and state
 * @returns {boolean} returns.updateAvailable - Whether a new version is ready
 * @returns {boolean} returns.isInstalling - Update installation in progress
 * @returns {Function} returns.applyUpdate - Function to install pending update
 * @returns {Function} returns.skipUpdate - Function to defer update to later
 * @returns {Function} returns.checkForUpdate - Function to manually check for updates
 *
 * @example
 * ```tsx
 * // Simple update notification
 * function UpdateNotification() {
 *   const { updateAvailable, applyUpdate, isInstalling } = usePWAUpdate();
 *
 *   if (!updateAvailable) return null;
 *
 *   return (
 *     <div className="update-notification">
 *       <span>🚀 New version available!</span>
 *       <button onClick={applyUpdate} disabled={isInstalling}>
 *         {isInstalling ? 'Updating...' : 'Update Now'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Advanced update banner with user choices
 * function UpdateBanner() {
 *   const {
 *     updateAvailable,
 *     isInstalling,
 *     applyUpdate,
 *     skipUpdate,
 *     checkForUpdate
 *   } = usePWAUpdate();
 *
 *   const [dismissed, setDismissed] = useState(false);
 *
 *   const handleUpdate = async () => {
 *     try {
 *       await applyUpdate();
 *       analytics.track('pwa_update_applied');
 *     } catch (error) {
 *       analytics.track('pwa_update_failed', undefined, { error: error.message });
 *     }
 *   };
 *
 *   if (!updateAvailable || dismissed) return null;
 *
 *   return (
 *     <Toast className="update-toast">
 *       <div className="update-content">
 *         <h4>✨ Website Updated!</h4>
 *         <p>New features and improvements are ready.</p>
 *         <div className="update-actions">
 *           <button
 *             onClick={handleUpdate}
 *             disabled={isInstalling}
 *             className="primary"
 *           >
 *             {isInstalling ? 'Applying...' : 'Restart & Update'}
 *           </button>
 *           <button
 *             onClick={() => {
 *               skipUpdate();
 *               setDismissed(true);
 *             }}
 *             className="secondary"
 *           >
 *             Later
 *           </button>
 *         </div>
 *       </div>
 *     </Toast>
 *   );
 * }
 * ```
 *
 * @dependencies
 * - `logger` - Update process logging and error reporting
 * - `notificationService` - User notifications for update status
 * - Service Worker API - Required for PWA update functionality
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
        if (!('serviceWorker' in navigator)) {
          return undefined;
        }

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

          if (!newWorker) {
            return;
          }

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
    if (sessionStorage.getItem('pwa-update-dismissed')) {
      return false;
    }

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

  if (!shouldShowUpdate) {
    return null;
  }

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

  if (!isVisible) {
    return null;
  }

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
