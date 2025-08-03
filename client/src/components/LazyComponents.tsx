// Lazy loading for better performance
import { lazy, Suspense } from "react";

// Lazy load heavy components
export const Gallery = lazy(() => import("../pages/Gallery"));
export const RSVP = lazy(() => import("../pages/RSVP"));
export const TravelGuide = lazy(() => import("../pages/TravelGuide"));

// Loading component
// Enhanced loading component with wedding theme
export function LoadingSpinner({
  message = "Loading...",
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

// Wrapper for lazy components with enhanced loading
export function LazyComponent({
  Component,
  loadingMessage,
  ...props
}: {
  Component: React.LazyExoticComponent<any>;
  loadingMessage?: string;
  [key: string]: any;
}) {
  return (
    <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
      <Component {...props} />
    </Suspense>
  );
}
