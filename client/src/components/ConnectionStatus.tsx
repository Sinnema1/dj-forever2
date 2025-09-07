import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface ConnectionStatusProps {
  showWhenOnline?: boolean;
  className?: string;
}

export default function ConnectionStatus({ 
  showWhenOnline = false, 
  className = '' 
}: ConnectionStatusProps) {
  const { isOnline, isConnecting, connectionQuality } = useNetworkStatus();

  // Don't show anything when online unless explicitly requested
  if (isOnline && !showWhenOnline && !isConnecting) {
    return null;
  }

  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        text: 'Reconnecting...',
        icon: '🔄',
        bgColor: '#ff9800',
        textColor: '#fff'
      };
    }

    if (!isOnline) {
      return {
        text: 'You\'re offline',
        icon: '📵',
        bgColor: '#f44336',
        textColor: '#fff'
      };
    }

    // Online status (when showWhenOnline is true)
    return {
      text: connectionQuality === 'slow' ? 'Slow connection' : 'Connected',
      icon: connectionQuality === 'slow' ? '🐌' : '✅',
      bgColor: connectionQuality === 'slow' ? '#ff9800' : '#4caf50',
      textColor: '#fff'
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
        animation: isConnecting ? 'pulse 1.5s infinite' : 'none'
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
