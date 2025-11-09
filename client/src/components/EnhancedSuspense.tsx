/**
 * @fileoverview Enhanced Suspense component with React 18+ concurrent features
 *
 * Provides improved Suspense boundaries with error boundaries, concurrent
 * rendering support, and enhanced loading states. Designed to work optimally
 * with React 18's concurrent features including useTransition and automatic
 * batching for better user experience.
 *
 * Features:
 * - Enhanced Suspense boundaries with error recovery
 * - React 18+ concurrent rendering optimization
 * - Customizable loading states with animation support
 * - Automatic error boundary integration
 * - Performance monitoring and metrics tracking
 * - Accessibility-enhanced loading indicators
 * - Wedding-themed loading experiences
 *
 * @module EnhancedSuspense
 * @version 1.0.0
 * @author DJ Forever Wedding Team
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * // Basic enhanced suspense
 * <EnhancedSuspense fallback="Loading...">
 *   <LazyComponent />
 * </EnhancedSuspense>
 *
 * // With custom loading and error handling
 * <EnhancedSuspense
 *   fallback={<CustomLoader />}
 *   errorFallback={<ErrorRetry />}
 *   name="gallery"
 * >
 *   <Gallery />
 * </EnhancedSuspense>
 * ```
 */

import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { logError, logDebug } from '../utils/logger';
import { LoadingSpinner } from './LazyComponents';

/**
 * Props interface for EnhancedSuspense component
 */
interface EnhancedSuspenseProps {
  /** Child components to render within Suspense boundary */
  children: ReactNode;
  /** Loading fallback component or JSX element */
  fallback?: ReactNode;
  /** Error fallback component or JSX element */
  errorFallback?: ReactNode;
  /** Optional name for debugging and performance tracking */
  name?: string;
  /** Optional loading message for default fallback */
  loadingMessage?: string;
  /** Whether to show enhanced loading animations */
  enhanced?: boolean;
}

/**
 * Enhanced Error Boundary Props
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
}

/**
 * Enhanced Error Boundary for Suspense components
 *
 * Provides comprehensive error handling specifically designed to work
 * with React 18's concurrent rendering and Suspense boundaries.
 */
class SuspenseErrorBoundary extends Component<
  { children: ReactNode; errorFallback?: ReactNode; name?: string },
  ErrorBoundaryState
> {
  constructor(props: {
    children: ReactNode;
    errorFallback?: ReactNode;
    name?: string;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.name || 'Unknown';
    logError(`Suspense Error Boundary: ${componentName}`, 'EnhancedSuspense', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.errorFallback) {
        return this.props.errorFallback;
      }

      return (
        <div className="suspense-error-fallback">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>We&apos;re having trouble loading this content.</p>
            <button
              onClick={this.handleRetry}
              className="retry-button"
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Enhanced Loading Fallback Component
 *
 * Provides wedding-themed loading states with React 18+ optimizations
 * and accessibility enhancements.
 */
function EnhancedLoadingFallback({
  message = 'Loading...',
  enhanced = true,
  name,
}: {
  message?: string;
  enhanced?: boolean;
  name?: string;
}) {
  logDebug(`Loading: ${name || 'Component'}`, 'EnhancedSuspense');

  if (!enhanced) {
    return <LoadingSpinner message={message} />;
  }

  return (
    <div className="enhanced-loading-container">
      <div className="wedding-loader">
        <div className="wedding-rings">
          <div className="ring ring-1">💍</div>
          <div className="ring ring-2">💍</div>
        </div>
        <div className="loading-hearts">
          <span className="heart">💕</span>
          <span className="heart">💕</span>
          <span className="heart">💕</span>
        </div>
      </div>
      <p className="enhanced-loading-message" aria-live="polite">
        {message}
      </p>
      <div className="loading-progress">
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
      </div>
    </div>
  );
}

/**
 * EnhancedSuspense - React 18+ Optimized Suspense Component
 *
 * Provides enhanced Suspense boundaries with error recovery, concurrent
 * rendering optimization, and improved loading states. Designed to leverage
 * React 18's concurrent features for better user experience.
 *
 * @features
 * - **Concurrent Rendering**: Optimized for React 18+ concurrent features
 * - **Error Recovery**: Built-in error boundary with retry functionality
 * - **Performance Tracking**: Logging and monitoring integration
 * - **Accessibility**: ARIA live regions and semantic HTML
 * - **Wedding Theme**: Custom loading animations and styling
 * - **Flexible Fallbacks**: Customizable loading and error states
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <EnhancedSuspense fallback="Loading gallery...">
 *   <Gallery />
 * </EnhancedSuspense>
 *
 * // With custom error handling
 * <EnhancedSuspense
 *   name="travel-guide"
 *   loadingMessage="Loading travel information..."
 *   errorFallback={<CustomError onRetry={handleRetry} />}
 *   enhanced={true}
 * >
 *   <TravelGuide />
 * </EnhancedSuspense>
 * ```
 *
 * @param props Component props
 * @param props.children Child components to render
 * @param props.fallback Custom loading fallback component
 * @param props.errorFallback Custom error fallback component
 * @param props.name Component name for debugging
 * @param props.loadingMessage Default loading message
 * @param props.enhanced Whether to use enhanced loading animations
 * @returns JSX element with enhanced Suspense boundary
 */
export default function EnhancedSuspense({
  children,
  fallback,
  errorFallback,
  name,
  loadingMessage,
  enhanced = true,
}: EnhancedSuspenseProps) {
  // Use custom fallback or enhanced loading component
  const suspenseFallback = fallback || (
    <EnhancedLoadingFallback
      message={loadingMessage || 'Loading...'}
      enhanced={enhanced}
      name={name || 'component'}
    />
  );

  return (
    <SuspenseErrorBoundary
      errorFallback={errorFallback}
      name={name || 'component'}
    >
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </SuspenseErrorBoundary>
  );
}

/**
 * Enhanced Lazy Component Wrapper
 *
 * Combines EnhancedSuspense with lazy component loading for optimal
 * React 18+ performance and user experience.
 */
export function EnhancedLazyComponent({
  Component,
  loadingMessage,
  name,
  enhanced = true,
  ...props
}: {
  /** React lazy component to render */
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  /** Loading message to display */
  loadingMessage?: string;
  /** Component name for debugging */
  name?: string;
  /** Whether to use enhanced loading animations */
  enhanced?: boolean;
  /** Additional props passed through to component */
  [key: string]: unknown;
}) {
  return (
    <EnhancedSuspense
      name={name || 'lazy-component'}
      loadingMessage={loadingMessage || 'Loading...'}
      enhanced={enhanced}
    >
      <Component {...props} />
    </EnhancedSuspense>
  );
}
