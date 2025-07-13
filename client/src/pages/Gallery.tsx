import React, { useState } from "react";
import "../assets/styles.css";
import LightboxModal from "../components/LightboxModal";

const images = Object.values(
  import.meta.glob("../assets/images/gallery/*.{png,jpg,jpeg,svg}", {
    eager: true,
    as: "url",
  })
) as string[];

const Gallery: React.FC = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <div className="gallery-grid">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Gallery image ${idx + 1}`}
            className="gallery-image"
            style={{ cursor: "pointer" }}
            onClick={() => openLightbox(idx)}
          />
        ))}
      </div>
      {lightboxOpen && (
        <LightboxModal
          images={images}
          initialIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
};

export default Gallery;
