import React, { useState, useEffect } from "react";
import "../assets/styles.css";
import "../assets/swipeable-lightbox.css";
import SwipeableLightbox from "../components/SwipeableLightbox";
import { LazyImage } from "../components/LazyImage";
import { analytics } from "../utils/analytics";

const images = Object.values(
  import.meta.glob("../assets/images/gallery/*.{png,jpg,jpeg,svg}", {
    eager: true,
    as: "url",
  })
) as string[];

const Gallery: React.FC = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Track gallery view
    analytics.trackGalleryViewed();
  }, []);

  const openLightbox = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
    analytics.track("gallery_image_opened", undefined, { imageIndex: idx });
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
};

export default Gallery;
