import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
