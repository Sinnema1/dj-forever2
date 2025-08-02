import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PersonalizedContentProps {
  children: React.ReactNode;
  guestContent?: React.ReactNode;
  invitedOnlyContent?: React.ReactNode;
}

/**
 * Component that displays different content based on the user's authentication status:
 * - Not logged in: Shows default children
 * - Logged in but not invited: Shows guest content if provided, otherwise children
 * - Logged in and invited: Shows invited-only content if provided, otherwise guest content or children
 */
const PersonalizedContent: React.FC<PersonalizedContentProps> = ({
  children,
  guestContent,
  invitedOnlyContent
}) => {
  const { isLoggedIn, user } = useAuth();
  
  if (!isLoggedIn) {
    // Default content for all visitors
    return <>{children}</>;
  }
  
  if (user?.isInvited && invitedOnlyContent) {
    // Special content for invited guests
    return <>{invitedOnlyContent}</>;
  }
  
  if (guestContent) {
    // Content for any logged-in user
    return <>{guestContent}</>;
  }
  
  // Default fallback
  return <>{children}</>;
};

export default PersonalizedContent;
