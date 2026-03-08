import { details } from '../data/details';
// Styles now imported globally via main.tsx

export default function TheDetails() {
  return (
    <div className="details-container">
      {details.length > 0 ? (
        details.map(({ time, title, location, address, mapsUrl }) => (
          <div key={time} className="details-item">
            <span className="details-time">{time}</span>
            <h3>{title}</h3>
            {location && <p className="details-location">{location}</p>}
            {address && (
              <p className="details-address">
                {mapsUrl ? (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    {address}
                  </a>
                ) : (
                  address
                )}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="details-empty">No events at the moment</p>
      )}
    </div>
  );
}
