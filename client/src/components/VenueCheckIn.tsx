import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QrScanner from '../components/QrScanner';
import { logError } from '../utils/logger';
import { reportError } from '../services/errorReportingService';

interface CheckInData {
  guestId: string;
  checkInTime: Date;
  location: 'ceremony' | 'reception' | 'venue';
  guestName?: string | undefined;
}

interface CheckInResult {
  success: boolean;
  guestName?: string | undefined;
  message: string;
  timestamp: Date;
}

const VenueCheckIn: React.FC = () => {
  const { user, token } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState<CheckInResult[]>([]);
  const [error, setError] = useState<string>('');
  const [isStaff, setIsStaff] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<
    'ceremony' | 'reception' | 'venue'
  >('venue');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCheckIns, setPendingCheckIns] = useState<CheckInData[]>([]);

  const checkStaffStatus = useCallback(() => {
    if (
      user?.email?.includes('staff') ||
      user?.email?.includes('coordinator')
    ) {
      setIsStaff(true);
    }
  }, [user]);

  const loadPendingCheckIns = useCallback(() => {
    const stored = localStorage.getItem('pendingCheckIns');
    if (stored) {
      try {
        setPendingCheckIns(JSON.parse(stored));
      } catch (error) {
        logError(
          'Failed to load pending check-ins',
          error instanceof Error ? error.message : String(error)
        );
        reportError(error as Error, {
          component: 'VenueCheckIn',
          action: 'load_pending_checkins',
        });
      }
    }
  }, []);

  const submitCheckInToServer = useCallback(
    async (checkInData: CheckInData): Promise<void> => {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guestId: checkInData.guestId,
          location: checkInData.location,
          timestamp: checkInData.checkInTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in to server');
      }
    },
    [token]
  );

  const syncPendingCheckIns = useCallback(async () => {
    if (!isOnline || pendingCheckIns.length === 0) {
      return;
    }

    try {
      // Process sequentially to handle errors for each check-in individually
      /* eslint-disable no-await-in-loop */
      for (const checkIn of pendingCheckIns) {
        await submitCheckInToServer(checkIn);
      }
      /* eslint-enable no-await-in-loop */

      setPendingCheckIns([]);
      localStorage.removeItem('pendingCheckIns');

      addCheckInResult({
        success: true,
        message: `Synced ${pendingCheckIns.length} check-ins`,
        timestamp: new Date(),
      });
    } catch (error) {
      logError(
        'Failed to sync pending check-ins',
        error instanceof Error ? error.message : String(error)
      );
      reportError(error as Error, {
        component: 'VenueCheckIn',
        action: 'sync_pending_checkins',
        pendingCount: pendingCheckIns.length,
      });
    }
  }, [isOnline, pendingCheckIns, submitCheckInToServer]);

  const savePendingCheckIn = (checkIn: CheckInData) => {
    const updated = [...pendingCheckIns, checkIn];
    setPendingCheckIns(updated);
    localStorage.setItem('pendingCheckIns', JSON.stringify(updated));
  };

  useEffect(() => {
    checkStaffStatus();
    loadPendingCheckIns();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingCheckIns();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkStaffStatus, loadPendingCheckIns, syncPendingCheckIns]);

  const handleQRScan = async (qrData: string) => {
    try {
      setError('');

      const guestData = parseCheckInQR(qrData);

      if (!guestData) {
        throw new Error('Invalid check-in QR code');
      }

      const checkInData: CheckInData = {
        guestId: guestData.guestId,
        checkInTime: new Date(),
        location: currentLocation,
        guestName: guestData.guestName,
      };

      if (isOnline) {
        try {
          await submitCheckInToServer(checkInData);

          addCheckInResult({
            success: true,
            guestName: guestData.guestName,
            message: `Successfully checked in at ${currentLocation}`,
            timestamp: new Date(),
          });
        } catch (error) {
          savePendingCheckIn(checkInData);

          addCheckInResult({
            success: true,
            guestName: guestData.guestName,
            message: `Checked in offline - will sync when connection restored`,
            timestamp: new Date(),
          });
        }
      } else {
        savePendingCheckIn(checkInData);

        addCheckInResult({
          success: true,
          guestName: guestData.guestName,
          message: `Checked in offline - will sync when connection restored`,
          timestamp: new Date(),
        });
      }

      setIsScanning(false);
    } catch (error) {
      logError(
        'Check-in error',
        error instanceof Error ? error.message : String(error)
      );
      setError(error instanceof Error ? error.message : 'Check-in failed');

      addCheckInResult({
        success: false,
        message: error instanceof Error ? error.message : 'Check-in failed',
        timestamp: new Date(),
      });
    }
  };

  const parseCheckInQR = (
    qrData: string
  ): { guestId: string; guestName?: string } | null => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.guestId || parsed.id) {
        return {
          guestId: parsed.guestId || parsed.id,
          guestName: parsed.name || parsed.fullName,
        };
      }
    } catch {
      // Not JSON
    }

    if (qrData.includes('guest=') || qrData.includes('id=')) {
      try {
        const url = new URL(qrData);
        const guestId =
          url.searchParams.get('guest') || url.searchParams.get('id');
        const guestName = url.searchParams.get('name');

        if (guestId) {
          return {
            guestId,
            ...(guestName && { guestName }),
          };
        }
      } catch {
        // Invalid URL
      }
    }

    if (qrData.includes('@') || /^[a-zA-Z0-9-_]+$/.test(qrData)) {
      return {
        guestId: qrData,
      };
    }

    return null;
  };

  const addCheckInResult = (result: CheckInResult) => {
    setCheckInHistory(prev => [result, ...prev.slice(0, 9)]);
  };

  const manualCheckIn = async () => {
    // eslint-disable-next-line no-alert
    const guestId = prompt('Enter guest ID or email:');
    if (!guestId) {
      return;
    }

    await handleQRScan(guestId);
  };

  if (!isStaff) {
    return (
      <div className="venue-checkin-unauthorized">
        <h2>Access Restricted</h2>
        <p>This feature is only available to wedding staff and coordinators.</p>
      </div>
    );
  }

  return (
    <div className="venue-checkin">
      <div className="checkin-header">
        <h2>🏛️ Venue Check-In</h2>
        <div className="status-bar">
          <div className="connection-status">
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          {pendingCheckIns.length > 0 && (
            <div className="pending-status">
              📋 {pendingCheckIns.length} pending
            </div>
          )}
        </div>
      </div>

      <div className="location-selector">
        <label htmlFor="location-select">Check-in Location:</label>
        <select
          id="location-select"
          value={currentLocation}
          onChange={e =>
            setCurrentLocation(
              e.target.value as 'ceremony' | 'reception' | 'venue'
            )
          }
        >
          <option value="ceremony">Ceremony</option>
          <option value="reception">Reception</option>
          <option value="venue">General Venue</option>
        </select>
      </div>

      <div className="checkin-actions">
        {!isScanning ? (
          <>
            <button
              className="btn-primary scan-btn"
              onClick={() => setIsScanning(true)}
            >
              📷 Scan QR Code
            </button>
            <button
              className="btn-secondary manual-btn"
              onClick={manualCheckIn}
            >
              ✏️ Manual Check-In
            </button>
          </>
        ) : (
          <div className="scanner-container">
            <QrScanner
              onScan={handleQRScan}
              onError={err => setError(err.message)}
            />
            <button
              className="btn-secondary cancel-btn"
              onClick={() => setIsScanning(false)}
            >
              Cancel Scan
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {checkInHistory.length > 0 && (
        <div className="checkin-history">
          <h3>Recent Check-Ins</h3>
          <div className="history-list">
            {checkInHistory.map(result => (
              <div
                key={result.timestamp.toISOString()}
                className={`history-item ${result.success ? 'success' : 'error'}`}
              >
                <div className="history-icon">
                  {result.success ? '✅' : '❌'}
                </div>
                <div className="history-details">
                  {result.guestName && (
                    <div className="guest-name">{result.guestName}</div>
                  )}
                  <div className="history-message">{result.message}</div>
                  <div className="history-time">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .venue-checkin {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .venue-checkin-unauthorized {
          text-align: center;
          padding: 40px 20px;
        }

        .checkin-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .checkin-header h2 {
          color: #8B4513;
          margin-bottom: 10px;
        }

        .status-bar {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .connection-status {
          color: #666;
        }

        .pending-status {
          color: #ff6b35;
        }

        .location-selector {
          margin-bottom: 30px;
          text-align: center;
        }

        .location-selector label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #8B4513;
        }

        .location-selector select {
          padding: 10px 15px;
          border: 2px solid #C9A66B;
          border-radius: 8px;
          font-size: 16px;
        }

        .checkin-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .scan-btn, .manual-btn, .cancel-btn {
          padding: 15px 25px;
          font-size: 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .scan-btn {
          background: #C9A66B;
          color: white;
        }

        .scan-btn:hover {
          background: #B8956A;
        }

        .manual-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn {
          background: #dc3545;
          color: white;
        }

        .scanner-container {
          text-align: center;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .checkin-history {
          margin-top: 30px;
        }

        .checkin-history h3 {
          color: #8B4513;
          margin-bottom: 15px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          gap: 15px;
        }

        .history-item.success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }

        .history-item.error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .history-icon {
          font-size: 20px;
        }

        .history-details {
          flex: 1;
        }

        .guest-name {
          font-weight: 600;
          color: #8B4513;
        }

        .history-message {
          color: #666;
          margin: 5px 0;
        }

        .history-time {
          font-size: 12px;
          color: #999;
        }

        @media (max-width: 768px) {
          .checkin-actions {
            gap: 10px;
          }
          
          .scan-btn, .manual-btn {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default VenueCheckIn;
