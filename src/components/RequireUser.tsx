import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '../lib/queries';
import { Splash } from './Splash';

export function RequireUser() {
  const me = useMe();
  const loc = useLocation();
  const here = loc.pathname + loc.search;
  if (me.isPending) return <Splash />;
  if (!me.data) return <Navigate to={`/login?next=${encodeURIComponent(here)}`} replace />;
  if (!me.data.firstName && loc.pathname !== '/onboarding') {
    return <Navigate to={`/onboarding?next=${encodeURIComponent(here)}`} replace />;
  }
  return <Outlet />;
}
