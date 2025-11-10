/**
 * Toast Notification Component
 *
 * Lightweight, accessible toast notification system for user feedback.
 * Provides auto-dismissing notifications with multiple variants and
 * animation support with full accessibility support.
 *
 * @fileoverview Toast notification system for user feedback
 * @version 1.1.0
 *
 * @accessibility
 * - ARIA live regions for screen reader announcements
 * - Keyboard support (ESC key to dismiss)
 * - Respects prefers-reduced-motion
 * - Proper ARIA roles and labels
 * - Focus management for interactive toasts
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import './toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /** Unique identifier for the toast */
  id: string;
  /** Toast message content */
  message: string;
  /** Toast variant type */
  type: ToastType;
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss: (id: string) => void;
}

/**
 * Individual toast notification component with full accessibility support
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match CSS animation duration
  }, [id, onDismiss]);

  // Keyboard support - ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        handleDismiss();
      }
    };

    // Only add listener when toast is mounted
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration === 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  // Get descriptive message for screen readers
  const getScreenReaderMessage = () => {
    const typePrefix = type.charAt(0).toUpperCase() + type.slice(1);
    return `${typePrefix} notification: ${message}`;
  };

  return (
    <div
      ref={toastRef}
      className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Screen reader only text for better context - this will be announced */}
      <span className="sr-only">{getScreenReaderMessage()}</span>

      <div className="toast-icon" aria-hidden="true">
        {getIcon()}
      </div>
      <div className="toast-message" aria-hidden="true">
        {message}
      </div>
      <button
        className="toast-close"
        onClick={handleDismiss}
        aria-label={`Dismiss ${type} notification: ${message}`}
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
