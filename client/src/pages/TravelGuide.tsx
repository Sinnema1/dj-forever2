import React from "react";
import {
  FaAirbnb,
  FaCarSide,
  FaUtensils,
  FaMapMarkedAlt,
} from "react-icons/fa";
// Styles now imported globally via main.tsx

const TravelGuide: React.FC = () => (
  <div className="icons-grid">
    <a
      href="https://www.airbnb.com/s/7010-S-27th-Ave--Phoenix--AZ-85041/homes?adults=1&refinement_paths%5B%5D=%2Fhomes&place_id=ChIJ2S3s3ecQK4cRbj9AsdKw4UQ&query=7010%20S%2027th%20Ave%2C%20Phoenix%2C%20AZ%2085041&monthly_start_date=2026-04-01&monthly_length=3&monthly_end_date=2026-07-01&search_mode=regular_search&price_filter_input_type=2&channel=EXPLORE&date_picker_type=flexible_dates&flexible_trip_lengths%5B%5D=weekend_trip&flexible_trip_dates%5B%5D=november&source=structured_search_input_header&search_type=unknown"
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
