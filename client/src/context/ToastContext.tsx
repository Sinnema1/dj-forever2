/**
 * Toast Notification Context & Provider
 *
 * Global toast notification management system using React Context.
 * Provides a simple API to show toasts from anywhere in the application.
 *
 * @fileoverview Toast notification context for global toast management
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import Toast, { ToastType } from '../components/Toast';
import '../components/toast.css';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to access toast notification API
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { showSuccess, showError } = useToast();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await saveData();
 *       showSuccess('Data saved successfully!');
 *     } catch (error) {
 *       showError('Failed to save data. Please try again.');
 *     }
 *   };
 * }
 * ```
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider Component
 *
 * Wrap your app with this provider to enable toast notifications.
 *
 * @example
 * ```typescript
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastData = { id, message, type, duration };

      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  // Listen for custom toast events (e.g., from AuthContext)
  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        type: ToastType;
        message: string;
        duration?: number;
      }>;
      const { type, message, duration } = customEvent.detail;
      showToast(message, type, duration);
    };

    window.addEventListener('show-toast', handleToastEvent);
    return () => window.removeEventListener('show-toast', handleToastEvent);
  }, [showToast]);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-container"
        role="region"
        aria-label="Notifications"
        aria-relevant="additions"
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration ?? 5000}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
