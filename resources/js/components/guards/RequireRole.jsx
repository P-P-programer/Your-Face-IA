import { Navigate, Outlet } from "react-router-dom";
import { getUser, getToken } from "../../lib/session";

const normalizeRole = (r = "") => String(r).trim().toLowerCase().replace(/-/g, "_");

export default function RequireRole({ roles = [] }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = normalizeRole(user.role);
  const allowed = roles.map(normalizeRole).includes(currentRole);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}