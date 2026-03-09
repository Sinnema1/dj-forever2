import React from 'react';
import {
  FaAirbnb,
  FaCarSide,
  FaUtensils,
  FaMapMarkedAlt,
} from 'react-icons/fa';
// Styles now imported globally via main.tsx

const TravelGuide: React.FC = () => (
  <div className="icons-grid">
    <a
      href="https://www.airbnb.com/s/7010-S-27th-Ave--Phoenix--AZ-85041/homes"
      className="travel-icon-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaAirbnb className="travel-icon" />
      <span>Lodging</span>
    </a>

    <a
      href="https://turo.com/"
      className="travel-icon-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaCarSide className="travel-icon" />
      <span>Transportation</span>
    </a>

    <a
      href="https://www.yelp.com/search?find_desc=restaurants&find_loc=7010+S.+27th+Ave%2C+Phoenix%2C+AZ+85041"
      className="travel-icon-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaUtensils className="travel-icon" />
      <span>Places to Eat</span>
    </a>

    <a
      href="https://www.visitphoenix.com/"
      className="travel-icon-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaMapMarkedAlt className="travel-icon" />
      <span>Things to Do</span>
    </a>
  </div>
);

export default TravelGuide;
