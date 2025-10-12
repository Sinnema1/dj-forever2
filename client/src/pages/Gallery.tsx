import { useState, useEffect } from 'react';
// Styles now imported globally via main.tsx
import SwipeableLightbox from '../components/SwipeableLightbox';
import LazyImage from '../components/LazyImage';
import { analytics } from '../utils/analytics';

const images = Object.values(
  import.meta.glob('../assets/images/gallery/*.{png,jpg,jpeg,svg}', {
    eager: true,
    as: 'url',
  })
) as string[];

/**
 * Gallery - Simplified Photo Gallery
 *
 * Clean wedding photo gallery focused on viewing and navigation.
 * Displays all photos in a responsive grid with lightbox functionality.
 *
 * @features
 * - **Simple Grid Layout**: Clean photo grid with hover effects
 * - **Lightbox Modal**: Full-screen image viewing with touch/swipe support
 * - **Lazy Loading**: Optimized image loading for performance
 * - **Responsive Design**: Works perfectly on all device sizes
 * - **Analytics**: Tracks gallery usage for insights
 *
 * @component
 */
export default function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Track gallery view
    analytics.trackGalleryViewed();
  }, []);

  const openLightbox = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
    analytics.track('gallery_image_opened', undefined, { imageIndex: idx });
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      {/* Gallery Grid */}
      <div className="gallery-grid">
        {images.map((imageUrl, idx) => (
          <LazyImage
            key={`gallery-${idx}`}
            src={imageUrl}
            alt={`Wedding gallery photo ${idx + 1}`}
            onClick={() => openLightbox(idx)}
            loading={idx < 6 ? 'eager' : 'lazy'}
            priority={idx < 6}
            className="gallery-image"
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <SwipeableLightbox
          images={images}
          initialIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
