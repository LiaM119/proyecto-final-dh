// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function userIsAdmin(user) {
  if (!user) return false;
  if (user.admin === true) return true;

  const role = String(user.role || "").toUpperCase();
  return role === "ADMIN" || role === "ROLE_ADMIN";
}

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!user || !token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (adminOnly && !userIsAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
