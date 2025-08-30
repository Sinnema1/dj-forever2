import React, { useEffect, useState } from "react";
import "../assets/countdown-enhanced.css";

const WEDDING_DATE = new Date("2026-11-08T16:00:00-07:00");

export default function CountdownTimer() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const timeLeft = WEDDING_DATE.getTime() - Date.now();
      const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    };

    // Update immediately
    updateCountdown();

    // Update daily at midnight
    const interval = setInterval(updateCountdown, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

  if (daysLeft === 0) {
    return (
      <div className="countdown-simple">
        <p className="countdown-text">Today is the day! 💍</p>
      </div>
    );
  }

  return (
    <div className="countdown-simple">
      <p className="countdown-text">
        {daysLeft} {daysLeft === 1 ? "day" : "days"} to the big day
      </p>
    </div>
  );
}
