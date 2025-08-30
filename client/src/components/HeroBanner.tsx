import { useAuth } from "../context/AuthContext";
import CountdownTimer from "./CountdownTimer";
import "../assets/styles.css";
import PersonalizedContent from "./PersonalizedContent";

export default function HeroBanner() {
  const { user } = useAuth();

  // Default welcome message for all visitors
  const defaultWelcome = (
    <>
      <CountdownTimer />
      <h1 className="hero-title">We're Getting Married!</h1>
      <p className="hero-date-location">
        November 8, 2026, 4:00 PM | Venue at the Grove
      </p>
    </>
  );

  // Personalized welcome for guests who have logged in
  const guestWelcome = (
    <>
      <CountdownTimer />
      <h1 className="hero-title">We're Getting Married!</h1>
      <p className="hero-date-location">
        November 8, 2026, 4:00 PM | Venue at the Grove
      </p>
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
      </div>
    </section>
  );
}
