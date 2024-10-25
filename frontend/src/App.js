// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignIn from './pages/SignIn';
import ForgotPassword from './components/sign-in/ForgotPassword';
import AdminDashboard from './pages/Admin_Dashboard';
import EmployeeDashboard from './pages/Employee_Dashboard';

const theme = createTheme();

function App() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/admin_dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee_dashboard" element={<AdminDashboard />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword open={open} handleClose={handleClose} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
