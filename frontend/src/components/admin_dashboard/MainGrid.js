import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'; // Import the icon
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; // Import to access theme
import useMediaQuery from '@mui/material/useMediaQuery'; // Import to handle screen size changes
import Copyright from './internals/components/Copyright';
import CustomizedDataGrid from './CustomizedDataGrid';
import DetailsCard from './DetailsCard';
import ReportsCard from './ReportsCard';
import StatCard from './StatCard';

const data = [
  {
    title: 'Number of Employees',
    value: '30',
    interval: 'All Time',
    trend: 'up',
    data: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30 
    ] 
  },
  {
    title: 'Number of Travel Requests',
    value: '25',
    interval: 'Overall',
    trend: 'up',
    data: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
    ]  },
  {
    title: 'Number of Pending Requests',
    value: '15',
    interval: 'Overall',
    trend: 'up',
    data: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
    ]  
  },
];

export default function MainGrid() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme(); // Access the theme
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check if it's a small screen

  const handleNavigate = () => {
    navigate('/travel-requests'); // Navigate to TravelRequestPage.js route
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DetailsCard />
        </Grid>
      </Grid>

      {/* View All Employees' Travel Request with Button */}
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
      <FlightTakeoff sx={{ mr: 3 }} /> {/* Flight icon with margin-right */}
        <Typography component="h2" variant="h6" sx={{ mr: 3 }}> {/* Adjusted margin-right */}
          View Employees' Travel Request
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />} // Icon on the right side
          fullWidth={isSmallScreen} // Dynamically set fullWidth for small screens
          onClick={handleNavigate}
        >
          View Request
        </Button>
      </Box>

      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            { <ReportsCard /> }
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
