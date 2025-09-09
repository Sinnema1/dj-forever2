import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface LightboxModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const SwipeableLightbox: React.FC<LightboxModalProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [current, setCurrent] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Reset zoom when changing images
  const resetZoom = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    setIsZoomed(false);
  }, []);

  const prevImage = () => {
    if (isTransitioning) return;
    resetZoom();
    setIsTransitioning(true);
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    if (isTransitioning) return;
    resetZoom();
    setIsTransitioning(true);
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

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
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;

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
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEnd(e.targetTouches[0].clientX);

      // If zoomed, allow panning
      if (isZoomed) {
        e.preventDefault();
        const deltaX = e.targetTouches[0].clientX - (touchStart || 0);
        const deltaY = e.targetTouches[0].clientY - (touchStart || 0);
        setPanX((prev) => prev + deltaX * 0.5);
        setPanY((prev) => prev + deltaY * 0.5);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) return;

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
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Prevent body scroll when modal is open and fix scroll position issue
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      // Restore body scroll and position
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.top = "unset";
      document.body.style.width = "unset";

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [current, resetZoom]);

  // Create portal element to render modal at body level
  const modalContent = (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ×
        </button>

        <div
          ref={containerRef}
          className="lightbox-image-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            ref={imageRef}
            src={images[current]}
            alt={`Gallery image ${current + 1}`}
            className={`lightbox-image ${isTransitioning ? "transitioning" : ""} ${isZoomed ? "zoomed" : ""}`}
            loading="lazy"
            onTouchStart={handleDoubleTap}
            style={{
              transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
              transformOrigin: "center center",
              transition:
                isTransitioning || !isZoomed ? "transform 0.3s ease" : "none",
            }}
          />

          {/* Touch navigation hints - only show when not zoomed */}
          {!isZoomed && (
            <>
              <div className="swipe-hint left" onClick={prevImage}>
                <span>‹</span>
              </div>
              <div className="swipe-hint right" onClick={nextImage}>
                <span>›</span>
              </div>
            </>
          )}

          {/* Zoom indicator */}
          {isZoomed && (
            <div className="zoom-indicator" onClick={resetZoom}>
              <span>Tap to reset zoom</span>
            </div>
          )}
        </div>

        <div className="lightbox-controls">
          <button
            className="nav-button prev"
            onClick={prevImage}
            disabled={isTransitioning}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="image-counter">
            {current + 1} / {images.length}
          </div>

          <button
            className="nav-button next"
            onClick={nextImage}
            disabled={isTransitioning}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at body level
  return createPortal(modalContent, document.body);
};

export default SwipeableLightbox;
