import React, { useState } from "react";

interface LightboxModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [current, setCurrent] = useState(initialIndex);

  const prevImage = () =>
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () =>
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img
          src={images[current]}
          alt={`Gallery image ${current + 1}`}
          style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <button onClick={prevImage}>&larr; Prev</button>
          <span>
            {current + 1} / {images.length}
          </span>
          <button onClick={nextImage}>Next &rarr;</button>
        </div>
      </div>
    </div>
  );
};

export default LightboxModal;
