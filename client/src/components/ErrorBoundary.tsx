import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Optional: Send to error tracking service
    // trackError(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
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
  error?: Error;
  retry: () => void;
}) {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Oops! Something went wrong</h2>
        <p>
          We're sorry for the inconvenience. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === "development" && error && (
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
