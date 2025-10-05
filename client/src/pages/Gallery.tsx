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
      <div className="gallery-grid">
        {images.map((src, idx) => (
          <LazyImage
            key={idx}
            src={src}
            alt={`Gallery image ${idx + 1}`}
            onClick={() => openLightbox(idx)}
            loading={idx < 6 ? 'eager' : 'lazy'} // Only eager load first 6
            priority={idx < 6} // Load first 6 images immediately
          />
        ))}
      </div>
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
