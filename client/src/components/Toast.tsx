/**
 * Toast Notification Component
 *
 * Lightweight, accessible toast notification system for user feedback.
 * Provides auto-dismissing notifications with multiple variants and
 * animation support.
 *
 * @fileoverview Toast notification system for user feedback
 * @version 1.0.0
 */

import React, { useEffect, useState, useCallback } from 'react';
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
 * Individual toast notification component
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match CSS animation duration
  }, [id, onDismiss]);

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

  const getAriaLabel = () => {
    switch (type) {
      case 'success':
        return 'Success notification';
      case 'error':
        return 'Error notification';
      case 'warning':
        return 'Warning notification';
      case 'info':
        return 'Information notification';
      default:
        return 'Notification';
    }
  };

  return (
    <div
      className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={getAriaLabel()}
    >
      <div className="toast-icon" aria-hidden>
        {getIcon()}
      </div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
