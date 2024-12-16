import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; // Import to access theme
import useMediaQuery from '@mui/material/useMediaQuery'; // Import to handle screen size changes
import TravelRequestCard from './TravelRequestCard';
import TravelHistoryCard from './TravelHistoryCard';
import UseChatBotCard from './UseChatBotCard';
import StatCard from './StatCard';

const data = [
  {
    title: 'Latest Travel Request Status', // Updated title
    value: 'Pending', // Example status; adjust as needed
  },
  {
    title: 'Total Number of Travel Request', // Updated title
    value: '0 Requests', // Example value; adjust as needed
  },
  {
    title: 'Total Number of Travel History', // Updated title
    value: '0 Trips', // Example value; adjust as needed
  },
];


export default function MainGrid({ onChatbotClick }) {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme(); // Access the theme
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check if it's a small screen
  const [employeeName, setEmployeeName] = React.useState(''); // State for employee name

  React.useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/profile', { // Replace with your backend endpoint
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setEmployeeName(data.user.username); // Update employee name
        })
        .catch((error) => {
          console.error('Error fetching employee profile:', error);
        });
    }
  }, []);

  const handleNavigate = () => {
    navigate('/travel-requests'); // Navigate to TravelRequestPage.js route
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Welcome, {employeeName || 'Employee'} ! {/* Display employee name */}
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        {/* Optional content */}
      </Box>

      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 6, lg: 4 }}>
          <TravelRequestCard />
        </Grid>
        <Grid size={{ xs: 6, lg: 4 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <TravelHistoryCard />
          </Stack>
        </Grid>
        <Grid size={{ xs: 6, lg: 4 }}>
          {/* Pass the onChatbotClick prop to the UseChatBotCard */}
          <UseChatBotCard onChatbotClick={onChatbotClick} />
        </Grid>
      </Grid>
    </Box>
  );
}
