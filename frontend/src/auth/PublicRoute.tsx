import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }: { children: React.ReactElement }) {
  const isLogged = !!localStorage.getItem("token");
  if (isLogged) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;

}