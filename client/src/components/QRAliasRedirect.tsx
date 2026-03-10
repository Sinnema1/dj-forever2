import { Navigate, useParams } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';

// Matches the server-side alias validation in User model
const ALIAS_PATTERN = /^[a-z0-9-]{3,50}$/;

export default function QRAliasRedirect() {
  const { alias } = useParams<{ alias?: string }>();
  if (!alias || !ALIAS_PATTERN.test(alias)) {
    return <NotFoundPage />;
  }
  return <Navigate to={`/login/qr/${encodeURIComponent(alias)}`} replace />;
}
