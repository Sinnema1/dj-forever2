import React, { useState } from 'react';
// Styles now imported globally via main.tsx
import SwipeableLightbox from '../components/SwipeableLightbox';

import img2022_1 from '../assets/images/story-2022-1.jpeg';
import img2022_2 from '../assets/images/story-2022-2.jpeg';
import img2022_3 from '../assets/images/story-2022-3.jpeg';
import img2023_1 from '../assets/images/story-2023-1.jpeg';
import img2023_2 from '../assets/images/story-2023-2.jpeg';
import img2023_3 from '../assets/images/story-2023-3.jpeg';
import img2024_1 from '../assets/images/story-2024-1.jpeg';
import img2024_2 from '../assets/images/story-2024-2.jpeg';
import img2024_3 from '../assets/images/story-2024-3.jpeg';
import img2024_4 from '../assets/images/story-2024-4.jpeg';
import img2025_1 from '../assets/images/story-2025-1.jpeg';
import img2025_2 from '../assets/images/story-2025-2.jpeg';
import img2025_3 from '../assets/images/story-2025-3.jpeg';

interface StoryEvent {
  date: string;
  text: string;
  imageUrl: string;
}

const storyEvents: StoryEvent[] = [
  { date: '01.16.2022', text: 'We met & fell in love', imageUrl: img2022_1 },
  {
    date: '10.29.2022',
    text: 'Our first Halloween together',
    imageUrl: img2022_2,
  },
  { date: '11.06.2022', text: 'Our first trip!', imageUrl: img2022_3 },
  { date: '04.26.2023', text: 'We love a beach', imageUrl: img2023_1 },
  { date: '09.29.2023', text: 'Spoiled in Colorado', imageUrl: img2023_2 },
  { date: '12.03.2023', text: 'Sometimes, we fancy', imageUrl: img2023_3 },
  { date: '05.04.2024', text: 'Order up!', imageUrl: img2024_1 },
  { date: '07.29.2024', text: 'Croatia...wow', imageUrl: img2024_2 },
  { date: '08.07.2024', text: "Chef's kiss in Sorrento", imageUrl: img2024_3 },
  { date: '10.19.2024', text: "We're engaged!", imageUrl: img2024_4 },
  { date: '04.25.2025', text: 'Flo-Rida', imageUrl: img2025_1 },
  { date: '10.27.2025', text: 'Celebrating Family', imageUrl: img2025_2 },
  { date: '11.27.2025', text: 'Countdown to our wedding', imageUrl: img2025_3 },
];

const OurStory: React.FC = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  // Extract just the image URLs for the lightbox
  const imageUrls = storyEvents.map(evt => evt.imageUrl);

  const handleImageKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(idx);
    }
  };

  return (
    <>
      <div className="story-timeline">
        {storyEvents.map((evt, idx) => (
          <div key={evt.date} className="story-event">
            <button
              className="story-event-image-wrapper"
              onClick={() => openLightbox(idx)}
              onKeyDown={e => handleImageKeyDown(e, idx)}
              type="button"
              aria-label={`View full-size image: ${evt.text}`}
            >
              <img
                src={evt.imageUrl}
                alt={evt.text}
                className="story-event-image"
                loading="lazy"
              />
            </button>
            <div className="story-event-content">
              <span className="story-event-date">{evt.date}</span>
              <p className="story-event-text">{evt.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <SwipeableLightbox
          images={imageUrls}
          initialIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
};

export default OurStory;
