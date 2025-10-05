import { useState, useEffect } from 'react';
import { logInfo, logWarn, logError } from '../utils/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
}

/**
 * Enhanced PWA Install Hook
 *
 * Manages Progressive Web App installation prompts and state.
 * Provides elegant install prompts for wedding guests to add
 * the website to their home screen for easy access.
 *
 * @returns PWA install state and control functions
 *
 * @example
 * ```tsx
 * function InstallBanner() {
 *   const { isInstallable, showInstallPrompt, handleInstall } = usePWAInstall();
 *
 *   if (!isInstallable) return null;
 *
 *   return (
 *     <div className="install-banner">
 *       <p>Add to home screen for quick access!</p>
 *       <button onClick={handleInstall}>Install App</button>
 *     </div>
 *   );
 * }
 * ```
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
