import React, { useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import AdminDashboard from "./pages/Admin_Dashboard";
import EmployeeDashboard from "./pages/Employee_Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";  // Import the ResetPassword component
import { AuthContext, isAuthenticated, clearAuth } from "./utils/auth";

function App() {
  const [authState, setAuthState] = useState(isAuthenticated());

  const auth = useMemo(() => ({
    isLoggedIn: authState.isLoggedIn,
    user: authState.user,
    login: () => setAuthState(isAuthenticated()),
    logout: () => {
      clearAuth();
      setAuthState({ isLoggedIn: false, user: null });
    }
  }), [authState.isLoggedIn, authState.user]);

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={!auth.isLoggedIn ? "/signin" : auth.user?.role === "admin" ? "/admin_dashboard" : "/employee_dashboard"} />} />
          <Route
            path="/admin_dashboard"
            element={
              auth.isLoggedIn && auth.user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/employee_dashboard"
            element={
              auth.isLoggedIn && auth.user?.role === "employee" ? (
                <EmployeeDashboard />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/signin"
            element={
              !auth.isLoggedIn ? (
                <SignIn />
              ) : (
                <Navigate to={auth.user?.role === "admin" ? "/admin_dashboard" : "/employee_dashboard"} />
              )
            }
          />
          <Route 
            path="/forgot-password" 
            element={<ForgotPassword />}  // Forgot Password Route
          />
          <Route 
            path="/reset-password" 
            element={<ResetPassword />}  // Reset Password Route
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
