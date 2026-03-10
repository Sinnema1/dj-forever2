import { Navigate, useParams } from 'react-router-dom';

export default function QRAliasRedirect() {
  const { alias } = useParams<{ alias: string }>();
  return <Navigate to={`/login/qr/${alias}`} replace />;
}
