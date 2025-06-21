import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface RSVPButtonProps {
  className?: string;
}

export default function RSVPButton({
  className = "btn btn-primary",
}: RSVPButtonProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (!user?.isInvited) {
    return null; // Don't show RSVP button for non-invited users
  }

  return isHomePage ? (
    <a href="#rsvp" className={className}>
      RSVP
    </a>
  ) : (
    <Link to="/rsvp" className={className}>
      RSVP
    </Link>
  );
}
