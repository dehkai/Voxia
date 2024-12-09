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
import ResetPassword from "./pages/ResetPassword"; // Import the ResetPassword component
import UserProfile from "./pages/User_Profile";
import { AuthContext, isAuthenticated, clearAuth } from "./utils/auth";
import AdminLayout from "./layout/AdminLayout"; // Import Admin Layout
import EmployeeLayout from "./layout/EmployeeLayout"; // Import Employee Layout

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
          {/* Default redirect based on login status and role */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  !auth.isLoggedIn
                    ? "/signin"
                    : auth.user?.role === "admin"
                    ? "/admin_dashboard"
                    : "/employee_dashboard"
                }
              />
            }
          />

          {/* Admin Dashboard Route */}
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

          {/* Employee Dashboard Route */}
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

          {/* Sign In Route */}
          <Route
            path="/signin"
            element={
              !auth.isLoggedIn ? (
                <SignIn />
              ) : (
                <Navigate
                  to={
                    auth.user?.role === "admin"
                      ? "/admin_dashboard"
                      : "/employee_dashboard"
                  }
                />
              )
            }
          />

          {/* Forgot Password Route */}
          <Route path="/forgot-password" 
          element={<ForgotPassword />} />

          {/* Reset Password Route - with token handling */}
          <Route
            path="/reset-password"
            element={<ResetPassword />} // Make sure the component handles the token
          />
          <Route path="/" element={<Navigate to={!auth.isLoggedIn ? "/signin" : auth.user?.role === "admin" ? "/admin_dashboard" : "/employee_dashboard"} />} />

          {/* Root layout for all other routes */}
          <Route path="/*" element={auth.isLoggedIn && auth.user?.role === "admin" ? <AdminLayout /> : <EmployeeLayout />}>
            <Route
              path="admin_dashboard"
              element={
                auth.isLoggedIn && auth.user?.role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="employee_dashboard"
              element={
                auth.isLoggedIn && auth.user?.role === "employee" ? (
                  <EmployeeDashboard />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="signin"
              element={
                !auth.isLoggedIn ? (
                  <SignIn />
                ) : (
                  <Navigate to={auth.user?.role === "admin" ? "/admin_dashboard" : "/employee_dashboard"} />
                )
              }
            />
            <Route path="user_profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
