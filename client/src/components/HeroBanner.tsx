import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CountdownTimer from "./CountdownTimer";
import "../assets/styles.css";
import PersonalizedContent from "./PersonalizedContent";

export default function HeroBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Default welcome message for all visitors
  const defaultWelcome = (
    <>
      <h1 className="hero-title">We're getting married!</h1>
      <p className="hero-date">Sunday, November 8, 2026 | 4:00pm</p>
      <p className="hero-location">Greenwood Gardens, NJ</p>
    </>
  );

  // Personalized welcome for guests who have logged in
  const guestWelcome = (
    <>
      <h1 className="hero-title">We're getting married!</h1>
      <p className="hero-date">Sunday, November 8, 2026 | 4:00pm</p>
      <p className="hero-location">Greenwood Gardens, NJ</p>
      <p className="hero-personal-note">
        We're so glad you're here, {user?.fullName.split(" ")[0]}!
      </p>
    </>
  );

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <PersonalizedContent guestContent={guestWelcome}>
          {defaultWelcome}
        </PersonalizedContent>
        <CountdownTimer />
        <div className="hero-buttons">
          {user?.isInvited ? (
            isHomePage ? (
              <a href="#rsvp" className="btn btn-primary">
                RSVP
              </a>
            ) : (
              <Link to="/rsvp" className="btn btn-primary">
                RSVP
              </Link>
            )
          ) : null}

          <Link to="/registry" className="btn btn-outline">
            Registry
          </Link>

          {isHomePage ? (
            <a href="#travel" className="btn btn-outline">
              Travel Guide
            </a>
          ) : (
            <Link to="/#travel" className="btn btn-outline">
              Travel Guide
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
