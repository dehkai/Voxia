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
import CustomizedDataGrid from './CustomizedDataGrid';
import DetailsCard from './DetailsCard';
import ReportsCard from './ReportsCard';
import StatCard from './StatCard';

export default function MainGrid() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme(); // Access the theme
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Check if it's a small screen

  const [employeeCount, setEmployeeCount] = React.useState('Loading...');
  const [travelRequestCount, setTravelRequestCount] = React.useState('Loading...');
  const [pendingRequestCount, setPendingRequestCount] = React.useState('Loading...');

  // Fetch data from the backend when the component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee count
        const employeeRes = await fetch('http://localhost:5000/api/dashboard/employee-count');
        const employeeContentType = employeeRes.headers.get('content-type');
        if (employeeContentType && employeeContentType.includes('application/json')) {
          const employeeData = await employeeRes.json();
          setEmployeeCount(employeeData.data.employeeCount);
        } else {
          // Handle non-JSON response (likely HTML error)
          const text = await employeeRes.text();
          console.error('Expected JSON, received:', text);
        }
  
        // Fetch travel request count
        const travelRequestRes = await fetch('http://localhost:5000/api/dashboard/travel-request-count');
        const travelRequestContentType = travelRequestRes.headers.get('content-type');
        if (travelRequestContentType && travelRequestContentType.includes('application/json')) {
          const travelRequestData = await travelRequestRes.json();
          setTravelRequestCount(travelRequestData.data.travelRequestCount);
        } else {
          const text = await travelRequestRes.text();
          console.error('Expected JSON, received:', text);
        }
  
        // Fetch pending request count
        const pendingRequestRes = await fetch('http://localhost:5000/api/dashboard/pending-travel-request-count');
        const pendingRequestContentType = pendingRequestRes.headers.get('content-type');
        if (pendingRequestContentType && pendingRequestContentType.includes('application/json')) {
          const pendingRequestData = await pendingRequestRes.json();
          setPendingRequestCount(pendingRequestData.data.pendingRequestCount);
        } else {
          const text = await pendingRequestRes.text();
          console.error('Expected JSON, received:', text);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []); // Empty dependency array ensures this runs once when the component mounts
  

  // Create the data array dynamically
  const data = [
    {
      title: 'Number of Employees:',
      value: employeeCount,
    },
    {
      title: 'Number of Travel Requests:',
      value: travelRequestCount,
    },
    {
      title: 'Number of Pending Requests:',
      value: pendingRequestCount,
    },
  ];

  const handleNavigate = () => {
    navigate('/travel-requests-list'); // Navigate to TravelRequestPage.js route
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
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
            {<ReportsCard />}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
