import { Link } from "react-scroll";
import "../assets/styles.css";

const navLinks = [
  { label: "Home", to: "home" },
  { label: "Our Story", to: "ourstory" },
  { label: "The Details", to: "details" },
  { label: "Gallery", to: "gallery" },
  { label: "Wedding Party", to: "weddingparty" },
  { label: "Travel Guide", to: "travel" },
  { label: "FAQs", to: "faqs" },
  { label: "Registry", to: "registry" },
  { label: "RSVP", to: "rsvp" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">A&B</div>
      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link
              activeClass="active"
              to={link.to}
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
