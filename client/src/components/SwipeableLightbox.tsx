import React, { useState, useEffect, useRef } from "react";

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
  const imageRef = useRef<HTMLImageElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
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
          className="lightbox-image-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            ref={imageRef}
            src={images[current]}
            alt={`Gallery image ${current + 1}`}
            className={`lightbox-image ${isTransitioning ? "transitioning" : ""}`}
            loading="lazy"
          />

          {/* Touch navigation hints */}
          <div className="swipe-hint left" onClick={prevImage}>
            <span>‹</span>
          </div>
          <div className="swipe-hint right" onClick={nextImage}>
            <span>›</span>
          </div>
        </div>

        <div className="lightbox-controls">
          <button
            className="nav-button prev"
            onClick={prevImage}
            disabled={isTransitioning}
            aria-label="Previous image"
          >
            ‹ Prev
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
            Next ›
          </button>
        </div>

        {/* Image indicators */}
        <div className="lightbox-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === current ? "active" : ""}`}
              onClick={() => !isTransitioning && setCurrent(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableLightbox;
