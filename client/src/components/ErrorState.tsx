import React from 'react';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  type?: 'network' | 'loading' | 'generic';
  showDetails?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  type = 'generic',
  showDetails = false,
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return '📶';
      case 'loading':
        return '⏱️';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Problem';
      case 'loading':
        return 'Taking Longer Than Expected';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorMessage = () => {
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'loading':
        return 'The content is taking longer to load than usual.';
      default:
        return 'We&apos;re sorry, but something unexpected happened.';
    }
  };

  const errorString = typeof error === 'string' ? error : error.message;

  return (
    <div className="error-state">
      <div className="error-content">
        <div className="error-icon">{getErrorIcon()}</div>
        <h3 className="error-title">{getErrorTitle()}</h3>
        <p className="error-message">{getErrorMessage()}</p>

        {showDetails && errorString && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre className="error-trace">{errorString}</pre>
          </details>
        )}

        <div className="error-actions">
          {onRetry && (
            <button className="btn btn-primary error-retry" onClick={onRetry}>
              Try Again
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>

        {type === 'network' && (
          <div className="error-tips">
            <h4>Quick Fixes:</h4>
            <ul>
              <li>Check your Wi-Fi or mobile data connection</li>
              <li>Try moving to an area with better signal</li>
              <li>Disable VPN if you&apos;re using one</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
