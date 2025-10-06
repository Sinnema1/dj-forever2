/**
 * @fileoverview Lazy loading utilities for performance optimization
 *
 * Provides lazy-loaded components and loading utilities to improve initial
 * bundle size and page load performance. Uses React.lazy and Suspense for
 * code splitting with enhanced loading states and error boundaries.
 *
 * Features:
 * - Code splitting for heavy components
 * - Enhanced loading states with wedding theme
 * - Reusable lazy loading wrapper
 * - Performance-optimized component imports
 * - Customizable loading messages
 * - Accessibility-friendly loading indicators
 *
 * @module LazyComponents
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Use lazy component with wrapper
 * <LazyComponent
 *   Component={Gallery}
 *   loadingMessage="Loading photo gallery..."
 * />
 *
 * // Or use loading spinner directly
 * <LoadingSpinner message="Loading wedding details..." />
 * ```
 */

import { lazy, Suspense } from 'react';

/**
 * Lazy-loaded heavy components for code splitting
 * These components are loaded on-demand to improve initial page load performance
 */

/** Gallery component - Photo gallery with lightbox functionality */
export const Gallery = lazy(() => import('../pages/Gallery'));

/** RSVP component - RSVP form and management interface */
export const RSVP = lazy(() => import('../pages/RSVP'));

/** TravelGuide component - Travel information and accommodations */
export const TravelGuide = lazy(() => import('../pages/TravelGuide'));

/**
 * Enhanced loading spinner with wedding theme
 *
 * Provides a visually appealing loading indicator with customizable message
 * and accessibility features. Uses CSS animations for smooth visual feedback.
 *
 * @param props Component props
 * @param props.message Loading message to display
 * @returns JSX element with loading spinner and message
 *
 * @example
 * ```typescript
 * // Basic loading spinner
 * <LoadingSpinner />
 *
 * // With custom message
 * <LoadingSpinner message="Loading photo gallery..." />
 *
 * // Wedding-specific messages
 * <LoadingSpinner message="Preparing your wedding details..." />
 * ```
 *
 * @accessibility
 * - Loading message provides context for screen readers
 * - CSS animations respect prefers-reduced-motion
 * - Semantic HTML structure with proper roles
 */
export function LoadingSpinner({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

/**
 * Reusable wrapper for lazy-loaded components with enhanced loading states
 *
 * Provides consistent loading experience across all lazy-loaded components
 * with customizable loading messages and proper Suspense boundary handling.
 * Automatically passes through all props to the wrapped component.
 *
 * @param props Component wrapper props
 * @param props.Component React lazy component to render
 * @param props.loadingMessage Custom loading message
 * @param props.props Additional props passed to wrapped component
 * @returns JSX element with Suspense wrapper and loading fallback
 *
 * @example
 * ```typescript
 * // Basic lazy component
 * <LazyComponent Component={Gallery} />
 *
 * // With custom loading message
 * <LazyComponent
 *   Component={RSVP}
 *   loadingMessage="Loading RSVP form..."
 * />
 *
 * // Passing props to wrapped component
 * <LazyComponent
 *   Component={TravelGuide}
 *   loadingMessage="Loading travel information..."
 *   guestLocation="Seattle"
 *   showHotels={true}
 * />
 * ```
 *
 * @performance
 * - Enables code splitting for better initial load times
 * - Reduces JavaScript bundle size
 * - Improves Core Web Vitals scores
 * - Lazy loads components only when needed
 */
export function LazyComponent({
  Component,
  loadingMessage,
  ...props
}: {
  /** React lazy component to render */
  Component: React.LazyExoticComponent<any>;
  /** Optional custom loading message */
  loadingMessage?: string;
  /** Additional props passed through to component */
  [key: string]: any;
}) {
  return (
    <Suspense
      fallback={
        <LoadingSpinner
          {...(loadingMessage ? { message: loadingMessage } : {})}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
}
