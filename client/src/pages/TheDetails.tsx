import React from "react";
import { details } from "../data/details";
import "../assets/details.css";

export default function TheDetails() {
  return (
    <div className="details-container">
      {details.length > 0 ? (
        details.map(({ time, title, location }) => (
          <div key={time} className="details-item">
            <span className="details-time">{time}</span>
            <h3>{title}</h3>
            {location && <p className="details-location">{location}</p>}
          </div>
        ))
      ) : (
        <p className="details-empty">No events at the moment</p>
      )}
    </div>
  );
}
