import { useState, useRef, useEffect } from 'react';
import { logWarn, logDebug } from '../utils/logger';

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
export function LazyImage({
  src,
  alt,
  className,
  onClick,
  loading = 'lazy',
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images

    // Small delay to ensure DOM is properly laid out
    const checkViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;

        // If image is already in viewport (or close to it), load immediately
        if (rect.top < windowHeight + 100 && rect.bottom > -100) {
          logDebug(
            'Image already in viewport, loading immediately',
            'LazyImage',
            {
              src,
              rectTop: rect.top,
              windowHeight,
              isInViewport: true,
            }
          );
          setIsInView(true);
          return true;
        }
      }
      return false;
    };

    // Check immediately
    if (checkViewport()) return;

    // If not in viewport, set up intersection observer
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          logDebug('Intersection Observer triggered', 'LazyImage', { src });
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Fallback: if intersection observer fails, load after a delay
  useEffect(() => {
    if (priority || isInView) return;

    // Shorter fallback for gallery images (they're usually all visible)
    const isGalleryImage = src.includes('/gallery/');
    const fallbackDelay = isGalleryImage ? 1000 : 5000; // 1s for gallery, 5s for others

    const fallbackTimer = setTimeout(() => {
      // Only log non-gallery images to reduce console noise
      if (!isGalleryImage) {
        logDebug(
          `Fallback loading triggered (${isGalleryImage ? 'gallery' : 'standard'})`,
          'LazyImage',
          { src }
        );
      }
      setIsInView(true);
    }, fallbackDelay);

    return () => clearTimeout(fallbackTimer);
  }, [priority, isInView, src]);

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className || ''}`}
      onClick={onClick}
      style={{
        minHeight: '200px', // Ensure container has height for intersection observer
        display: 'block',
      }}
    >
      {isInView && !hasError && (
        <>
          {!isLoaded && (
            <div className="image-placeholder">
              <div className="loading-shimmer"></div>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              logWarn('Failed to load image', 'LazyImage', { src });
            }}
            loading={loading}
            style={{ display: isLoaded ? 'block' : 'none' }}
          />
        </>
      )}
      {hasError && (
        <div className="image-error">
          <span>📷</span>
          <p>Image unavailable</p>
        </div>
      )}
    </div>
  );
}
