import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastConnected: Date | null;
  connectionQuality: "slow" | "fast" | "unknown";
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnecting: false,
    lastConnected: navigator.onLine ? new Date() : null,
    connectionQuality: "unknown",
  });

  useEffect(() => {
    let qualityTest: number;

    const updateNetworkStatus = (isOnline: boolean) => {
      setNetworkStatus((prev) => ({
        ...prev,
        isOnline,
        lastConnected: isOnline ? new Date() : prev.lastConnected,
        isConnecting: false,
      }));
    };

    const handleOnline = async () => {
      setNetworkStatus((prev) => ({ ...prev, isConnecting: true }));

      // Validate actual connectivity by making a quick network request
      try {
        const start = performance.now();
        const response = await fetch("/manifest.json", {
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        });
        const end = performance.now();
        const responseTime = end - start;

        if (response.ok) {
          updateNetworkStatus(true);
          setNetworkStatus((prev) => ({
            ...prev,
            connectionQuality: responseTime < 1000 ? "fast" : "slow",
          }));
        } else {
          // False positive - still offline
          setNetworkStatus((prev) => ({ ...prev, isConnecting: false }));
        }
      } catch (error) {
        // Network request failed - still offline
        setNetworkStatus((prev) => ({ ...prev, isConnecting: false }));
      }
    };

    const handleOffline = () => {
      updateNetworkStatus(false);
    };

    // Periodic connectivity check when we think we're online
    const checkConnectivity = async () => {
      if (!navigator.onLine) return;

      try {
        await fetch("/manifest.json", {
          cache: "no-cache",
          signal: AbortSignal.timeout(3000),
        });
      } catch (error) {
        // We think we're online but can't reach the server
        updateNetworkStatus(false);
      }
    };

    // Set up event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connectivity every 30 seconds when online
    qualityTest = window.setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(qualityTest);
    };
  }, []);

  return networkStatus;
}
