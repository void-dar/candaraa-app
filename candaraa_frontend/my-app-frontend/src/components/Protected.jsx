import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";

export default function Protected({ children, role }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
