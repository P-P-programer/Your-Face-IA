import { Navigate, Outlet } from "react-router-dom";
import { getUser, getToken } from "../../lib/session";

export default function RequireRole({ roles = [] }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = roles.includes(user.role);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}