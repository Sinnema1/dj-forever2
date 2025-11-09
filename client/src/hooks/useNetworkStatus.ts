/**
 * Network Status Monitoring Hook
 *
 * Comprehensive network connectivity monitoring for the DJ Forever 2 wedding
 * website. Provides real-time network status, connection quality assessment,
 * and intelligent connectivity validation to enhance user experience during
 * RSVP submissions and photo viewing.
 *
 * @fileoverview Network status hook with intelligent connectivity detection
 * @version 2.0
 * @since 1.0.0
 *
 * @features
 * - **Real-time Monitoring**: Live network status updates
 * - **Connection Quality**: Fast/slow connection detection
 * - **Intelligent Validation**: Actual server connectivity testing
 * - **Periodic Checks**: Background connectivity validation
 * - **Error Resilience**: Graceful handling of network failures
 * - **Performance Aware**: Minimal overhead monitoring
 */

import { useState, useEffect } from 'react';
import { reportError } from '../services/errorReportingService';

/**
 * Network status information interface
 *
 * @interface NetworkStatus
 */
export interface NetworkStatus {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Whether the device is attempting to reconnect */
  isConnecting: boolean;
  /** Timestamp of last successful connection (null if never connected) */
  lastConnected: Date | null;
  /** Assessed connection quality based on response times */
  connectionQuality: 'slow' | 'fast' | 'unknown';
}

/**
 * useNetworkStatus - Network Connectivity Monitoring Hook
 *
 * Monitors network connectivity status with intelligent validation and quality
 * assessment. Goes beyond basic navigator.onLine to provide accurate connectivity
 * information by testing actual server communication. Essential for wedding
 * website reliability during critical RSVP submissions.
 *
 * @hook
 * @returns {NetworkStatus} Current network status and connection information
 *
 * @example
 * ```tsx
 * // Basic connectivity indicator
 * function ConnectionIndicator() {
 *   const { isOnline, isConnecting, connectionQuality } = useNetworkStatus();
 *
 *   if (isConnecting) {
 *     return <span className="connecting">🔄 Reconnecting...</span>;
 *   }
 *
 *   if (!isOnline) {
 *     return <span className="offline">⚠️ No connection</span>;
 *   }
 *
 *   return (
 *     <span className={`online ${connectionQuality}`}>
 *       ✅ {connectionQuality === 'slow' ? 'Slow connection' : 'Connected'}
 *     </span>
 *   );
 * }
 * ```
 *
 * @example\n * ```typescript\n * // RSVP form with network-aware submission\n * function RSVPForm() {\n *   const { isOnline, connectionQuality } = useNetworkStatus();\n *   const [isSubmitting, setIsSubmitting] = useState(false);\n *\n *   const handleSubmit = async (formData) => {\n *     if (!isOnline) {\n *       toast.error('Please check your internet connection and try again.');\n *       return;\n *     }\n *\n *     if (connectionQuality === 'slow') {\n *       toast.info('Slow connection detected. This may take a moment...');\n *     }\n *\n *     setIsSubmitting(true);\n *     // Submit logic with error handling\n *   };\n *\n *   return (\n *     // Form JSX with network-aware button states\n *     // Disabled when offline, shows connection status\n *   );\n * }\n * ```"
 *
 * @dependencies
 * - `errorReportingService` - Network error tracking and reporting
 * - Navigator API - Basic online/offline detection
 * - Fetch API - Server connectivity validation
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnecting: false,
    lastConnected: navigator.onLine ? new Date() : null,
    connectionQuality: 'unknown',
  });

  useEffect(() => {
    const updateNetworkStatus = (isOnline: boolean) => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline,
        lastConnected: isOnline ? new Date() : prev.lastConnected,
        isConnecting: false,
      }));
    };

    const handleOnline = async () => {
      setNetworkStatus(prev => ({ ...prev, isConnecting: true }));

      // Validate actual connectivity by making a quick network request
      try {
        const start = performance.now();
        const response = await fetch('/manifest.json', {
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000),
        });
        const end = performance.now();
        const responseTime = end - start;

        if (response.ok) {
          updateNetworkStatus(true);
          setNetworkStatus(prev => ({
            ...prev,
            connectionQuality: responseTime < 1000 ? 'fast' : 'slow',
          }));
        } else {
          // False positive - still offline
          setNetworkStatus(prev => ({ ...prev, isConnecting: false }));
        }
      } catch (error) {
        // Network request failed - still offline
        reportError(error as Error, {
          component: 'useNetworkStatus',
          action: 'connectivity_check',
        });
        setNetworkStatus(prev => ({ ...prev, isConnecting: false }));
      }
    };

    const handleOffline = () => {
      updateNetworkStatus(false);
    };

    // Periodic connectivity check when we think we're online
    const checkConnectivity = async () => {
      if (!navigator.onLine) {
        return;
      }

      try {
        await fetch('/manifest.json', {
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000),
        });
      } catch (error) {
        // We think we're online but can't reach the server
        reportError(error as Error, {
          component: 'useNetworkStatus',
          action: 'periodic_connectivity_check',
        });
        updateNetworkStatus(false);
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connectivity every 30 seconds when online
    const qualityTest = window.setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityTest);
    };
  }, []);

  return networkStatus;
}
