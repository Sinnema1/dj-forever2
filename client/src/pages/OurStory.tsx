import React from "react";
// Styles now imported globally via main.tsx

import img2022_1 from "../assets/images/story-2022-1.jpeg";
import img2022_2 from "../assets/images/story-2022-2.jpeg";
import img2022_3 from "../assets/images/story-2022-3.jpeg";
import img2022_4 from "../assets/images/story-2022-4.jpeg";
import img2022_5 from "../assets/images/story-2022-5.jpeg";
import img2022_6 from "../assets/images/story-2022-6.jpeg";
import img2023_1 from "../assets/images/story-2023-1.jpeg";
import img2023_2 from "../assets/images/story-2023-2.jpeg";
import img2023_3 from "../assets/images/story-2023-3.jpeg";
import img2024_1 from "../assets/images/story-2024-1.jpeg";
import img2024_2 from "../assets/images/optimized/story-2024-2-large.jpeg";
import img2024_3 from "../assets/images/story-2024-3.jpeg";
import img2024_4 from "../assets/images/story-2024-4.jpeg";
import img2024_5 from "../assets/images/story-2024-5.jpeg";
import img2024_6 from "../assets/images/optimized/story-2024-6-large.jpeg";
import img2024_7 from "../assets/images/story-2024-7.jpeg";
import img2024_8 from "../assets/images/story-2024-8.jpeg";
import img2024_9 from "../assets/images/story-2024-9.jpeg";

interface StoryEvent {
  date: string;
  text: string;
  imageUrl: string;
}

const storyEvents: StoryEvent[] = [
  { date: "01.01.2022", text: "We met & fell in love", imageUrl: img2022_1 },
  {
    date: "02.14.2022",
    text: "Our first Valentine's Day together",
    imageUrl: img2022_2,
  },
  { date: "03.10.2022", text: "Spring adventures begin", imageUrl: img2022_3 },
  { date: "04.20.2022", text: "We traveled to the coast", imageUrl: img2022_4 },
  { date: "05.15.2022", text: "Summer fun and fishing", imageUrl: img2022_5 },
  { date: "06.30.2022", text: "We moved in together", imageUrl: img2022_6 },
  { date: "01.24.2023", text: "We’re engaged!", imageUrl: img2023_1 },
  { date: "03.12.2023", text: "We adopted Goosey", imageUrl: img2023_2 },
  { date: "05.05.2023", text: "Exploring new places", imageUrl: img2023_3 },
  { date: "01.01.2024", text: "Wedding planning begins", imageUrl: img2024_1 },
  {
    date: "02.14.2024",
    text: "Valentine's Day as fiancés",
    imageUrl: img2024_2,
  },
  {
    date: "03.10.2024",
    text: "Spring adventures continue",
    imageUrl: img2024_3,
  },
  {
    date: "04.20.2024",
    text: "Finalizing wedding details",
    imageUrl: img2024_4,
  },
  {
    date: "05.15.2024",
    text: "Celebrating with friends & family",
    imageUrl: img2024_5,
  },
  { date: "06.30.2024", text: "Ready for the big day!", imageUrl: img2024_6 },
  { date: "07.01.2024", text: "Countdown to our wedding", imageUrl: img2024_7 },
  { date: "07.10.2024", text: "Rehearsal dinner", imageUrl: img2024_8 },
  { date: "07.13.2024", text: "Wedding day!", imageUrl: img2024_9 },
];

const OurStory: React.FC = () => (
  <div className="story-timeline">
    {storyEvents.map((evt) => (
      <div key={evt.date} className="story-event">
        <img
          src={evt.imageUrl}
          alt={evt.text}
          className="story-event-image"
          loading="lazy"
        />
        <div className="story-event-content">
          <span className="story-event-date">{evt.date}</span>
          <p className="story-event-text">{evt.text}</p>
        </div>
      </div>
    ))}
  </div>
);

export default OurStory;
