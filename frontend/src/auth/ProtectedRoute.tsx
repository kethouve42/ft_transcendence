import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isLogged = !!localStorage.getItem("token");
  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }
  return children;
}