import React, { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-11-08T16:00:00-05:00");

type TimeUnit = {
  value: number;
  label: string;
};

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(WEDDING_DATE.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(WEDDING_DATE.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) {
    return <div className="countdown-complete">It's wedding time!</div>;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const timeUnits: TimeUnit[] = [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "minutes" },
    { value: seconds, label: "seconds" },
  ];

  return (
    <div className="countdown-container">
      <div className="countdown">
        {timeUnits.map((unit, index) => (
          <div key={index} className="countdown-unit">
            <div className="countdown-value">{unit.value}</div>
            <div className="countdown-label">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
