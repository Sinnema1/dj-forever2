import React, { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: "lazy" | "eager";
  priority?: boolean; // For hero images that should load immediately
}

export function LazyImage({
  src,
  alt,
  className,
  onClick,
  loading = "lazy",
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start loading 100px before entering viewport
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
    if (!priority && !isInView) {
      const fallbackTimer = setTimeout(() => {
        console.log("Fallback loading triggered for:", src);
        setIsInView(true);
      }, 2000); // Load after 2 seconds if intersection observer hasn't triggered

      return () => clearTimeout(fallbackTimer);
    }
  }, [priority, isInView, src]);

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className || ""}`}
      onClick={onClick}
      style={{
        minHeight: "200px", // Ensure container has height for intersection observer
        display: "block",
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
            className={`lazy-image ${isLoaded ? "loaded" : "loading"}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              console.warn(`Failed to load image: ${src}`);
            }}
            loading={loading}
            style={{ display: isLoaded ? "block" : "none" }}
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
