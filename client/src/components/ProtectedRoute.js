import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
