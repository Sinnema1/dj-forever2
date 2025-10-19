import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RSVPButtonProps {
  className?: string;
}

export default function RSVPButton({
  className = 'btn btn-primary',
}: RSVPButtonProps) {
  const { user } = useAuth();

  if (!user?.isInvited) {
    return null; // Don't show RSVP button for non-invited users
  }

  // Always navigate to standalone RSVP page (no #rsvp section exists on homepage)
  return (
    <Link to="/rsvp" className={className}>
      RSVP
    </Link>
  );
}
