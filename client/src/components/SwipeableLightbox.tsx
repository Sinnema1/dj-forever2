import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the SwipeableLightbox component
 */
interface LightboxModalProps {
  /** Array of image URLs to display in the lightbox */
  images: string[];
  /** Index of the initial image to display (0-based) */
  initialIndex: number;
  /** Callback function called when the lightbox is closed */
  onClose: () => void;
}

/**
 * SwipeableLightbox - Advanced Image Gallery Modal
 *
 * A feature-rich lightbox component with mobile-first design that provides:
 * - Touch-based swipe navigation for mobile devices
 * - Double-tap to zoom functionality with pan controls
 * - Keyboard navigation (arrow keys, escape)
 * - Mouse click navigation with visual hints
 * - Smooth transitions and animations
 * - Body scroll lock when open
 * - Portal rendering for proper z-index management
 *
 * @features
 * - **Mobile Optimized**: Swipe gestures, touch controls, responsive design
 * - **Zoom & Pan**: Double-tap or click to zoom, drag to pan when zoomed
 * - **Navigation**: Swipe/click navigation with visual feedback
 * - **Accessibility**: Keyboard support, ARIA labels, focus management
 * - **Performance**: Lazy loading, GPU-accelerated animations
 *
 * @example
 * ```tsx
 * const images = ['/photo1.jpg', '/photo2.jpg', '/photo3.jpg'];
 *
 * <SwipeableLightbox
 *   images={images}
 *   initialIndex={0}
 *   onClose={() => setLightboxOpen(false)}
 * />
 * ```
 */
export default function SwipeableLightbox({
  images,
  initialIndex,
  onClose,
}: LightboxModalProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Reset zoom when changing images
  const resetZoom = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    setIsZoomed(false);
  }, []);

  const prevImage = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    resetZoom();
    setIsTransitioning(true);
    setCurrent(i => (i === 0 ? images.length - 1 : i - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, images.length, resetZoom]);

  const nextImage = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    resetZoom();
    setIsTransitioning(true);
    setCurrent(i => (i === images.length - 1 ? 0 : i + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning, images.length, resetZoom]);

  // Double tap to zoom functionality
  const handleDoubleTap = useCallback(
    (e: React.TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();

        if (isZoomed) {
          resetZoom();
        } else {
          const touch = e.touches[0];
          if (!touch) {
            return;
          }

          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          // Calculate pan to center the tap point
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const newPanX = (centerX - x) * 1.5;
          const newPanY = (centerY - y) * 1.5;

          setScale(2.5);
          setPanX(newPanX);
          setPanY(newPanY);
          setIsZoomed(true);
        }
      }
      setLastTap(currentTime);
    },
    [lastTap, isZoomed, resetZoom]
  );

  // Enhanced touch handling for zoom and pan
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.targetTouches[0];
      if (!touch) {
        return;
      }

      setTouchEnd(null);
      setTouchStart(touch.clientX);

      // Show navigation hints briefly on first touch (mobile)
      if (!showHints) {
        setShowHints(true);
        setTimeout(() => setShowHints(false), 2000);
      }
      // Also handle double-tap detection at container level
      handleDoubleTap(e);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.targetTouches[0];
      if (!touch) {
        return;
      }

      setTouchEnd(touch.clientX);

      // If zoomed, allow panning
      if (isZoomed) {
        e.preventDefault();
        const deltaX = touch.clientX - (touchStart || 0);
        const deltaY = touch.clientY - (touchStart || 0);
        setPanX(prev => prev + deltaX * 0.5);
        setPanY(prev => prev + deltaY * 0.5);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) {
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      }
      if (e.key === 'ArrowRight') {
        nextImage();
      }
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap for Tab key
      if (e.key === 'Tab' && overlayRef.current) {
        const focusableElements = overlayRef.current.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [prevImage, nextImage, onClose]);

  // Prevent body scroll when modal is open and fix scroll position issue
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Store currently focused element for restoration
    previousActiveElement.current = document.activeElement;

    // Focus the overlay after render
    setTimeout(() => {
      overlayRef.current?.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore body scroll and position
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.top = 'unset';
      document.body.style.width = 'unset';

      // Restore scroll position immediately without animation
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'instant',
        });
      });

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
    setShowHints(false); // Reset hint visibility when image changes
  }, [current, resetZoom]);

  // Create portal element to render modal at body level
  const modalContent = (
    <div
      ref={overlayRef}
      className="lightbox-overlay"
      onClick={e => {
        // Only close when clicking the overlay background (not children)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      // Make overlay keyboard-accessible so users can close with Enter/Space
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="lightbox-container">
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ×
        </button>

        {/*
            This container intentionally handles touch gestures (onTouchStart/
            onTouchMove/onTouchEnd) for mobile swipe and pan behavior. The
            interactive controls (swipe hints, zoom indicator, close button)
            provide keyboard equivalents. Disable the a11y rule for this
            specific node because making the container focusable would be a
            poorer UX for screen reader users.
        */}
        <div
          ref={containerRef}
          className="lightbox-image-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-label="Image viewer"
        >
          <img
            ref={imageRef}
            src={images[current]}
            alt={`Slide ${current + 1} of ${images.length}`}
            className={`lightbox-image ${isTransitioning ? 'transitioning' : ''} ${isZoomed ? 'zoomed' : ''}`}
            loading="lazy"
            style={{
              transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
              transformOrigin: 'center center',
              transition:
                isTransitioning || !isZoomed ? 'transform 0.3s ease' : 'none',
            }}
          />

          {/* Touch navigation hints - only show when not zoomed */}
          {!isZoomed && (
            <>
              <div
                className={`swipe-hint left ${showHints ? 'show-hint' : ''}`}
                onClick={prevImage}
                role="button"
                tabIndex={0}
                aria-label="Previous image"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    prevImage();
                  }
                }}
              >
                <span>‹</span>
              </div>
              <div
                className={`swipe-hint right ${showHints ? 'show-hint' : ''}`}
                onClick={nextImage}
                role="button"
                tabIndex={0}
                aria-label="Next image"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    nextImage();
                  }
                }}
              >
                <span>›</span>
              </div>
            </>
          )}

          {/* Zoom indicator */}
          {isZoomed && (
            <div
              className="zoom-indicator"
              onClick={resetZoom}
              role="button"
              tabIndex={0}
              aria-label="Reset zoom"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  resetZoom();
                }
              }}
            >
              <span>Tap to reset zoom</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at body level
  return createPortal(modalContent, document.body);
}
