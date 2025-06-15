import CountdownTimer from "./CountdownTimer";
import "../assets/styles.css";

export default function HeroBanner() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">We're getting married!</h1>
        <p className="hero-date">Sunday, November 8, 2026 | 4:00pm</p>
        <p className="hero-location">Greenwood Gardens, NJ</p>
        <CountdownTimer />
        <div className="hero-buttons">
          <a href="#rsvp" className="btn btn-primary">
            RSVP
          </a>
          <a href="#registry" className="btn btn-outline">
            Registry
          </a>
          <a href="#travel" className="btn btn-outline">
            Travel Guide
          </a>
        </div>
      </div>
    </section>
  );
}
