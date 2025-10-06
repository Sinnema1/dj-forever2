/**
 * PWA Installation Hook
 *
 * Comprehensive Progressive Web App installation management for the DJ Forever 2
 * wedding website. Provides seamless app installation experience for wedding guests,
 * allowing them to add the website to their home screen for quick access to RSVP,
 * photos, and wedding information.
 *
 * @fileoverview PWA installation hook with elegant user experience
 * @version 2.0
 * @since 1.0.0
 *
 * @features
 * - **Install Prompt Management**: Handles browser install prompts elegantly
 * - **Installation Detection**: Detects if app is already installed
 * - **Cross-Platform Support**: Works on iOS, Android, and desktop browsers
 * - **User Experience**: Provides smooth installation flow with proper timing
 * - **Analytics Integration**: Tracks installation events and user choices
 * - **Fallback Support**: Graceful handling for unsupported browsers
 */

import { useState, useEffect } from 'react';
import { logInfo, logWarn, logError } from '../utils/logger';

/**
 * Browser's beforeinstallprompt event interface
 *
 * Extended Event interface that includes PWA installation methods
 * provided by modern browsers for controlling app installation.
 */
interface BeforeInstallPromptEvent extends Event {
  /** Triggers the browser's installation prompt */
  prompt(): Promise<void>;
  /** Promise that resolves with user's installation choice */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * PWA installation state interface
 *
 * @interface PWAInstallState
 */
interface PWAInstallState {
  /** Whether the app can be installed (browser supports PWA installation) */
  isInstallable: boolean;
  /** Whether the app is currently installed (running in standalone mode) */
  isInstalled: boolean;
  /** Whether to show the custom installation prompt */
  showInstallPrompt: boolean;
  /** The browser's install prompt event (null if not available) */
  installPromptEvent: BeforeInstallPromptEvent | null;
}

/**
 * usePWAInstall - Progressive Web App Installation Hook
 *
 * Manages the complete PWA installation lifecycle including installation detection,
 * prompt management, and user experience optimization. Provides wedding guests with
 * an elegant way to install the website as an app for quick access to RSVP forms,
 * photo galleries, and wedding information.
 *
 * @hook
 * @returns {Object} PWA installation utilities and state
 * @returns {boolean} returns.canInstall - Whether PWA installation is available
 * @returns {boolean} returns.isInstalled - Whether app is currently installed
 * @returns {boolean} returns.isInstalling - Installation process in progress
 * @returns {Function} returns.promptInstall - Function to trigger installation prompt
 * @returns {Function} returns.dismissPrompt - Function to dismiss installation prompt
 *
 * @example
 * ```tsx
 * // Basic installation banner
 * function InstallBanner() {
 *   const { canInstall, isInstalled, promptInstall } = usePWAInstall();
 *
 *   if (isInstalled || !canInstall) return null;
 *
 *   return (
 *     <div className="install-banner">
 *       <h3>📱 Add to Home Screen</h3>
 *       <p>Get quick access to wedding info, RSVP, and photos!</p>
 *       <button onClick={promptInstall}>Install App</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Advanced installation card with analytics
 * function PWAInstallCard() {
 *   const {
 *     canInstall,
 *     isInstalled,
 *     isInstalling,
 *     promptInstall,
 *     dismissPrompt
 *   } = usePWAInstall();
 *
 *   const handleInstall = async () => {
 *     try {
 *       await promptInstall();
 *       analytics.track('pwa_install_completed');
 *     } catch (error) {
 *       analytics.track('pwa_install_failed', undefined, { error: error.message });
 *     }
 *   };
 *
 *   if (isInstalled) {
 *     return (
 *       <div className="install-success">
 *         ✅ App installed! Access from your home screen.
 *       </div>
 *     );
 *   }
 *
 *   if (!canInstall) return null;
 *
 *   return (
 *     <Card className="pwa-install-card">
 *       <CardHeader>
 *         <h3>Install Wedding App</h3>
 *         <button onClick={dismissPrompt} aria-label="Dismiss">×</button>
 *       </CardHeader>
 *       <CardContent>
 *         <p>Add our wedding website to your home screen for:</p>
 *         <ul>
 *           <li>🎉 Quick access to RSVP</li>
 *           <li>📸 Easy photo viewing</li>
 *           <li>📅 Wedding day reminders</li>
 *           <li>🗺️ Travel information</li>
 *         </ul>
 *         <button
 *           onClick={handleInstall}
 *           disabled={isInstalling}
 *           className="install-button"
 *         >
 *           {isInstalling ? 'Installing...' : 'Add to Home Screen'}
 *         </button>
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 *
 * @dependencies
 * - `logger` - Debug logging and error reporting
 * - Browser PWA support - beforeinstallprompt event
 * - Service Worker - Required for PWA installation
 */
export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    showInstallPrompt: false,
    installPromptEvent: null,
  });

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia
      ? window.matchMedia('(display-mode: standalone)').matches
      : false;
    const isInWebAppMode = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppMode;

    setState(prev => ({ ...prev, isInstalled }));

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;

      // Prevent the default prompt
      e.preventDefault();

      logInfo('PWA install prompt available', 'PWAInstall');

      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPromptEvent: event,
      }));

      // Show our custom prompt after a delay (let user explore first)
      setTimeout(() => {
        setState(prev => ({ ...prev, showInstallPrompt: true }));
      }, 30000); // Show after 30 seconds
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      logInfo('PWA successfully installed', 'PWAInstall');

      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        showInstallPrompt: false,
        installPromptEvent: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!state.installPromptEvent) {
      logWarn('No install prompt event available', 'PWAInstall');
      return false;
    }

    try {
      // Show the install prompt
      await state.installPromptEvent.prompt();

      // Wait for user choice
      const choiceResult = await state.installPromptEvent.userChoice;

      logInfo('PWA install choice', 'PWAInstall', {
        outcome: choiceResult.outcome,
      });

      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          showInstallPrompt: false,
          installPromptEvent: null,
        }));
        return true;
      }

      return false;
    } catch (error) {
      logError('Failed to show install prompt', 'PWAInstall', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setState(prev => ({ ...prev, showInstallPrompt: false }));

    // Don't show again this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const shouldShowPrompt = () => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) return false;

    // Don't show if already installed
    if (state.isInstalled) return false;

    // Only show if installable and prompt is ready
    return state.isInstallable && state.showInstallPrompt;
  };

  return {
    ...state,
    handleInstall,
    dismissInstallPrompt,
    shouldShowPrompt: shouldShowPrompt(),
  };
}

/**
 * PWA Install Banner Component
 *
 * Displays an elegant install prompt for wedding guests
 * to add the website to their home screen.
 */
export function PWAInstallBanner() {
  const { shouldShowPrompt, handleInstall, dismissInstallPrompt } =
    usePWAInstall();

  if (!shouldShowPrompt) return null;

  return (
    <div className="pwa-install-banner">
      <div className="install-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>Add to Home Screen</h3>
          <p>Get quick access to all wedding details!</p>
        </div>
        <div className="install-actions">
          <button
            onClick={handleInstall}
            className="install-btn install-btn-primary"
          >
            Install
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="install-btn install-btn-secondary"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PWA Install Card Component
 *
 * More prominent install prompt for specific pages
 * like RSVP completion or photo sharing.
 */
export function PWAInstallCard() {
  const { isInstallable, isInstalled, handleInstall } = usePWAInstall();

  if (!isInstallable || isInstalled) return null;

  return (
    <div className="pwa-install-card">
      <div className="card-header">
        <div className="card-icon">🏠</div>
        <h3>Add Wedding App</h3>
      </div>

      <div className="card-content">
        <p>Install our wedding app for:</p>
        <ul>
          <li>📱 Quick access from home screen</li>
          <li>📵 Offline access to wedding details</li>
          <li>🔔 Push notifications for updates</li>
          <li>📸 Easy photo sharing</li>
        </ul>
      </div>

      <div className="card-actions">
        <button onClick={handleInstall} className="install-card-btn">
          Add to Home Screen
        </button>
      </div>
    </div>
  );
}
