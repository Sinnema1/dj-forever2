import React, { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-11-08T16:00:00-05:00");

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(WEDDING_DATE.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(WEDDING_DATE.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) return <span>It's wedding time!</span>;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span className="countdown">
      {days} days {hours}h {minutes}m {seconds}s
    </span>
  );
}
