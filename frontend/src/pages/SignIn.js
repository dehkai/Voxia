import React, { useState,useContext } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { SitemarkIcon } from '../components/sign-in/CustomIcons';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/auth';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function SignIn(props) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Add state for remember me
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Add handler for remember me checkbox
  const handleRememberMe = (event) => {
    setRememberMe(event.target.checked);
  };

  const attemptLogin = async (email, password, retryCount = 0) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      return { response, result };
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await wait(RETRY_DELAY);
        return attemptLogin(email, password, retryCount + 1);
      }
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!validateInputs()) {
        setIsLoading(false);
        return;
      }

      const formData = new FormData(event.currentTarget);
      const email = formData.get('email');
      const password = formData.get('password');

      const { response, result } = await attemptLogin(email, password);

      if (response.ok) {
        // Store user data in the selected storage based on rememberMe state
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Store the data
        storage.setItem('token', result.token);
        storage.setItem('user', JSON.stringify(result.user));

        // Update auth context
        auth.login();

        // Wait a brief moment to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Navigate based on role with replace to prevent back navigation
        const dashboardRoute = result.user.role === 'admin' ? '/admin_dashboard' : '/employee_dashboard';
        navigate(dashboardRoute, { replace: true });
      } else {
        setEmailError(true);
        setEmailErrorMessage(result.message || 'Invalid credentials');
        console.error('Login failed:', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setEmailError(true);
      setEmailErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@origtek.com.my"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
                sx={{ ariaLabel: 'email' }}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Link
                  component="button"
                  type="button"
                  onClick={handleClickOpen} // Open "Forgot Password" dialog
                  variant="body2"
                  sx={{ alignSelf: 'baseline' }}
                >
                  Forgot your password?
                </Link>
              </Box>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMe}
                  name="remember"
                  color="primary"
                />
              }
              label="Remember me"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>          
        </Card>
      </SignInContainer>
      
    </AppTheme>
  );
}
