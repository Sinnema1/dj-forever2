import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles.css";
import LoginModal from "./LoginModal";

// Links for the main page sections (hash links)
const sectionLinks = [
  { label: "Home", to: "home" },
  { label: "Our Story", to: "our-story" },
  { label: "The Details", to: "details" },
  { label: "Gallery", to: "gallery" },
  { label: "Wedding Party", to: "wedding-party" },
  { label: "Travel Guide", to: "travel" },
  { label: "FAQs", to: "faqs" },
  { label: "Guestbook", to: "guestbook" },
];

// Links for standalone pages (router links)
const pageLinks = [
  { label: "Registry", to: "/registry" },
  { label: "RSVP", to: "/rsvp", requiresInvitation: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to detect the active section
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100;
  
        // Find the current section in view
        const sections = document.querySelectorAll("section[id]");
        sections.forEach((section) => {
          const sectionTop = (section as HTMLElement).offsetTop;
          const sectionHeight = (section as HTMLElement).offsetHeight;
          const sectionId = section.getAttribute("id") || "";
  
          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sectionId);
          }
        });
      };
  
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Call once on mount to set initial active section
  
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !target.closest(".navbar-links") &&
        !target.closest(".navbar-mobile-toggle")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  const isHomePage = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">Dominique &amp; Justin</Link>
      <div className={`navbar-mobile-toggle ${mobileMenuOpen ? "open" : ""}`} onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
        {isHomePage ? (
          // Section links (hash links) when on the home page
          sectionLinks.map((link, index) => (
            <li
              key={link.to}
              style={{ "--item-index": index } as React.CSSProperties}
            >
              <a
                href={`#${link.to}`}
                onClick={() => setMobileMenuOpen(false)}
                className={activeSection === link.to ? "active" : ""}
              >
                {link.label}
              </a>
            </li>
          ))
        ) : (
          // Just Home link when on other pages
          <li style={{ "--item-index": 0 } as React.CSSProperties}>
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
          </li>
        )}
        
        {/* Always show standalone page links */}
        {pageLinks.map((link, index) => {
          // Skip RSVP if user is not invited
          if (link.requiresInvitation && !user?.isInvited) return null;
          
          return (
            <li
              key={link.to}
              style={{ "--item-index": index + (isHomePage ? sectionLinks.length : 1) } as React.CSSProperties}
            >
              <Link
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={location.pathname === link.to ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        {/* Auth buttons */}
        <li style={{ "--item-index": 999 } as React.CSSProperties}>
          {!isLoggedIn ? (
            <button className="btn btn-outline" onClick={() => setLoginModalOpen(true)}>
              Login
            </button>
          ) : (
            <button className="btn btn-outline" onClick={logout}>
              Logout
            </button>
          )}
        </li>
      </ul>
      {mobileMenuOpen && (
        <div className="navbar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </nav>
  );
}
