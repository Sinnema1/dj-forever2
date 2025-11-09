import React from 'react';
import { reportComponentError } from '../services/errorReportingService';

/**
 * State interface for ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error object, if any */
  error?: Error | undefined;
}

/**
 * Props interface for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to render and monitor for errors */
  children: React.ReactNode;
  /** Optional custom fallback component to render when errors occur */
  fallback?: React.ComponentType<{
    error?: Error | undefined;
    retry: () => void;
  }>;
  /** Optional component name for error reporting context */
  componentName?: string;
}

/**
 * ErrorBoundary - React Error Boundary with Enhanced Error Reporting
 *
 * A robust error boundary component that catches JavaScript errors anywhere in the
 * child component tree, logs error information, and displays a fallback UI.
 *
 * Integrates with the application's error reporting service to provide:
 * - Automatic error capture and reporting
 * - Contextual error information with component names
 * - User-friendly fallback UI with retry functionality
 * - Development-friendly error details
 *
 * @features
 * - **Error Capture**: Catches and handles React component errors
 * - **Error Reporting**: Automatic integration with error reporting service
 * - **Fallback UI**: Displays user-friendly error messages
 * - **Retry Functionality**: Allows users to attempt recovery
 * - **Development Tools**: Shows detailed error info in development
 * - **Customizable**: Supports custom fallback components
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With component name for better error tracking
 * <ErrorBoundary componentName="PhotoGallery">
 *   <PhotoGallery photos={photos} />
 * </ErrorBoundary>
 *
 * // With custom fallback component
 * <ErrorBoundary fallback={CustomErrorComponent}>
 *   <ComplexComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use enhanced error reporting service
    reportComponentError(error, errorInfo, this.props.componentName);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  retry,
}: {
  error?: Error | undefined;
  retry: () => void;
}) {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Oops! Something went wrong</h2>
        <p>
          We&apos;re sorry for the inconvenience. Please try refreshing the
          page.
        </p>
        {import.meta.env.DEV && error && (
          <details className="error-details">
            <summary>Error Details (Development)</summary>
            <pre>{error.stack}</pre>
          </details>
        )}
        <div className="error-actions">
          <button onClick={retry} className="btn btn-primary">
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
