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
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/User_Profile";
import TravelRequestsList from './pages/TravelRequestsList';
import EmployeeDetails from './pages/EmployeeDetails';
import TravelReports from './pages/TravelReports';
import TravelRequests from './pages/TravelRequests';
import TravelHistory from './pages/TravelHistory';
import { AuthContext, isAuthenticated, clearAuth } from "./utils/auth";
import AdminLayout from "./layout/AdminLayout"; 
import EmployeeLayout from "./layout/EmployeeLayout"; 

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
                  to={auth.user?.role === "admin" ? "/admin_dashboard" : "/employee_dashboard"}
                />
              )
            }
          />

          {/* User Profile Route */}
          <Route path="/user_profile" element={<UserProfile />} />

          {/* Forgot Password Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Reset Password Route */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Pages for Travel Request*/}
          <Route path="/travel-requests-list" element={<TravelRequestsList />} />

          {/* Pages for Employees' Details*/}
          <Route path="/employee-details" element={<EmployeeDetails />} />

          {/* Pages for Travel' Report*/}
          <Route path="/travel-reports" element={<TravelReports />} />

          {/* Pages for My Travel' Request*/}
          <Route path="/travel-requests" element={<TravelRequests />} />

          {/* Pages for My Travel' History*/}
          <Route path="/travel-history" element={<TravelHistory />} />

          {/* Root layout for all other routes */}
          <Route path="/*" element={auth.isLoggedIn && auth.user?.role === "admin" ? <AdminLayout /> : <EmployeeLayout />}>
            <Route path="signin" element={<SignIn />} />
            
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
