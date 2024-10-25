// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignIn from './components/sign-in/SignIn';
import ForgotPassword from './components/sign-in/ForgotPassword';

const theme = createTheme();

function App() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword open={open} handleClose={handleClose} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
