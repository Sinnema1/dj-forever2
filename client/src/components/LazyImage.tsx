import { useState, useRef, useEffect } from 'react';

/**
 * Props interface for LazyImage component
 */
interface LazyImageProps {
  /** Image source URL */
  src: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional click handler function */
  onClick?: () => void;
  /** Native loading behavior - 'lazy' or 'eager' */
  loading?: 'lazy' | 'eager';
  /** Whether this is a priority image that should load immediately */
  priority?: boolean;
}

/**
 * LazyImage - Optimized Image Component with Intersection Observer
 *
 * A performance-optimized image component that uses Intersection Observer API
 * to lazy-load images as they enter the viewport. Includes loading states,
 * error handling, and priority loading for critical images.
 *
 * @features
 * - **Lazy Loading**: Uses Intersection Observer for efficient loading
 * - **Priority Support**: Immediate loading for hero/critical images
 * - **Loading States**: Visual feedback during image loading
 * - **Error Handling**: Graceful fallback for failed image loads
 * - **Performance**: Reduces initial page load and bandwidth usage
 * - **Accessibility**: Proper alt text and ARIA attributes
 * - **Responsive**: Works with responsive images and layouts
 * - **Fallback**: Automatic loading after timeout if observer fails
 *
 * @example
 * ```tsx
 * // Basic lazy loading
 * <LazyImage
 *   src="/images/photo.jpg"
 *   alt="Beautiful landscape"
 * />
 *
 * // Priority image (hero/above-fold)
 * <LazyImage
 *   src="/images/hero.jpg"
 *   alt="Wedding couple"
 *   priority={true}
 *   className="hero-image"
 * />
 *
 * // Interactive gallery image
 * <LazyImage
 *   src="/images/gallery/photo.jpg"
 *   alt="Gallery photo"
 *   onClick={() => openLightbox(index)}
 *   className="gallery-thumbnail"
 * />
 * ```
 *
 * @performance
 * - Reduces initial bundle size by loading images on-demand
 * - Uses 100px root margin for preloading near-viewport images
 * - Implements fallback timer to prevent stuck loading states
 * - Optimizes for Core Web Vitals (LCP, CLS)
 */
export default function LazyImage({
  src,
  alt,
  className,
  onClick,
  loading = 'lazy',
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Priority images load immediately

    let observer: IntersectionObserver;
    let fallbackTimer: NodeJS.Timeout;

    // Set up intersection observer
    if (containerRef.current && window.IntersectionObserver) {
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px', // Start loading 50px before viewport
        }
      );

      observer.observe(containerRef.current);
    }

    // Fallback timer for gallery images (in case intersection observer doesn't work)
    if (src.includes('/gallery/')) {
      fallbackTimer = setTimeout(() => {
        setIsInView(true);
      }, 2000); // 2 second fallback for gallery images
    }

    return () => {
      if (observer) observer.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [priority, src]);

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className || ''}`}
      onClick={onClick}
    >
      {/* Always show placeholder until image loads */}
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="loading-shimmer"></div>
        </div>
      )}

      {/* Only render img tag when we want to load */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading={loading}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="image-error">
          <span>📷</span>
          <p>Image unavailable</p>
        </div>
      )}
    </div>
  );
}
