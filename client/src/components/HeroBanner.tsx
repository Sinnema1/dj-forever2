import CountdownTimer from "./CountdownTimer";
import "../assets/styles.css";

export default function HeroBanner() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">We’re getting married!</h1>
        <p className="hero-date">Sunday, November 8, 2026 | 4:00pm</p>
        <p className="hero-location">Greenwood Gardens, NJ</p>
        <CountdownTimer />
        <div className="hero-links">
          <a href="#rsvp" className="btn">RSVP</a>
          <a href="#registry" className="btn">Registry</a>
          <a href="#travel" className="btn">Travel Guide</a>
        </div>
      </div>
    </section>
  );
}
