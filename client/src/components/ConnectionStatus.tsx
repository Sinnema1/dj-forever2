/**
 * @fileoverview Network connection status indicator component
 *
 * Real-time network connection status display with visual indicators for
 * online, offline, and connection quality states. Provides user feedback
 * for network-dependent operations like RSVP submission and photo uploads.
 *
 * Features:
 * - Real-time connection monitoring
 * - Connection quality indicators (fast/slow)
 * - Offline state detection and messaging
 * - Reconnection status with loading indicators
 * - Configurable visibility options
 * - Accessible design with clear visual cues
 * - Mobile-optimized positioning
 *
 * @module ConnectionStatus
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic usage (only shows when offline/connecting)
 * <ConnectionStatus />
 *
 * // Always visible with connection quality
 * <ConnectionStatus showWhenOnline={true} />
 *
 * // With custom styling
 * <ConnectionStatus
 *   className="custom-connection-status"
 *   showWhenOnline={false}
 * />
 * ```
 */

import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Props for ConnectionStatus component configuration
 * @interface ConnectionStatusProps
 */
interface ConnectionStatusProps {
  /** Whether to show status when online (default: false) */
  showWhenOnline?: boolean;
  /** Additional CSS class names for styling */
  className?: string;
}

/**
 * Real-time network connection status indicator
 *
 * Displays current network connectivity status with visual indicators
 * for different connection states. Provides immediate feedback to users
 * about network availability for wedding website operations.
 *
 * @component
 * @param props Configuration options for connection status display
 * @returns JSX element with connection status indicator or null
 *
 * @example
 * ```typescript
 * * @example\n * ```typescript\n * // Standard usage - only shows when offline or connecting\n * // <ConnectionStatus />\n * \n * // Always show status including connection quality\n * // <ConnectionStatus showWhenOnline={true} />\n * \n * // RSVP form with connection awareness\n * // Shows connection status above form for user feedback\n * ```
 * ```
 *
 * @features
 * - **Smart Visibility**: Only shows when relevant (offline/connecting)
 * - **Connection Quality**: Indicates slow vs fast connections
 * - **Visual Feedback**: Color-coded status with emoji indicators
 * - **Responsive Design**: Fixed positioning optimized for mobile
 * - **Accessibility**: Clear text and color contrast
 *
 * @dependencies
 * - `useNetworkStatus` - Real-time network monitoring hook
 */
export default function ConnectionStatus({
  showWhenOnline = false,
  className = '',
}: ConnectionStatusProps) {
  /** Network status information from monitoring hook */
  const { isOnline, isConnecting, connectionQuality } = useNetworkStatus();

  // Don't show anything when online unless explicitly requested
  if (isOnline && !showWhenOnline && !isConnecting) {
    return null;
  }

  /**
   * Determine status information based on current connection state
   * @returns Object with text, icon, and color information for display
   */
  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        text: 'Reconnecting...',
        icon: '🔄',
        bgColor: '#ff9800',
        textColor: '#fff',
      };
    }

    if (!isOnline) {
      return {
        text: "You're offline",
        icon: '📵',
        bgColor: '#f44336',
        textColor: '#fff',
      };
    }

    // Online status (when showWhenOnline is true)
    return {
      text: connectionQuality === 'slow' ? 'Slow connection' : 'Connected',
      icon: connectionQuality === 'slow' ? '🐌' : '✅',
      bgColor: connectionQuality === 'slow' ? '#ff9800' : '#4caf50',
      textColor: '#fff',
    };
  };

  const status = getStatusInfo();

  return (
    <div
      className={`connection-status ${className}`}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: status.bgColor,
        color: status.textColor,
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        animation: isConnecting ? 'pulse 1.5s infinite' : 'none',
      }}
    >
      <span style={{ fontSize: '16px' }}>{status.icon}</span>
      <span>{status.text}</span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .connection-status {
          backdrop-filter: blur(10px);
        }
        
        @media (max-width: 768px) {
          .connection-status {
            top: 5px;
            right: 5px;
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
}
