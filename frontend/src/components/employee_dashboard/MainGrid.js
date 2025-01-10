import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TravelRequestCard from './TravelRequestCard';
import UpcomingTripsCard from './UpcomingTripsCard';
import UseChatBotCard from './UseChatBotCard';
import StatCard from './StatCard';

export default function MainGrid({ onChatbotClick }) {
  const [employeeName, setEmployeeName] = React.useState(''); // State for employee name
  const [latestTravelStatus, setLatestTravelStatus] = React.useState('Loading...');
  const [totalRequests, setTotalRequests] = React.useState('Loading...');
  const [totalHistory, setTotalHistory] = React.useState('Loading...');
  const [employeeEmail, setEmployeeEmail] = React.useState(''); // State for employee email

  // Function to determine the color based on the travel status
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';  // Orange for pending
      case 'APPROVED':
        return 'green';   // Green for approved
      case 'REJECTED':
        return 'red';     // Red for rejected
      default:
        return 'black';   // Default black color for unknown status
    }
  };

  React.useEffect(() => {
    // Function to handle fetching profile and travel status
    const fetchData = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      try {
        // Fetch employee profile
        const profileRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileContentType = profileRes.headers.get('content-type');
        if (profileContentType && profileContentType.includes('application/json')) {
          const profileData = await profileRes.json();
          setEmployeeName(profileData.user.username);
          setEmployeeEmail(profileData.user.email);
        } else {
          const text = await profileRes.text();
          console.error('Expected JSON for profile, received:', text);
        }

        // Once email is set, fetch the latest travel request status
        if (employeeEmail) {
          const travelStatusRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/travel-requests/${employeeEmail}/latest-status`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const travelStatusContentType = travelStatusRes.headers.get('content-type');
          if (travelStatusContentType && travelStatusContentType.includes('application/json')) {
            const travelStatusData = await travelStatusRes.json();
            setLatestTravelStatus(travelStatusData.data.status.toUpperCase() || 'No Requests');
          } else {
            const text = await travelStatusRes.text();
            console.error('Expected JSON for travel status, received:', text);
          }
        }

        // Fetch total number of travel requests
        const travelRequestRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/travel-request-count/${employeeEmail}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const travelRequestContentType = travelRequestRes.headers.get('content-type');
        if (travelRequestContentType && travelRequestContentType.includes('application/json')) {
          const travelRequestData = await travelRequestRes.json();
          setTotalRequests(`${travelRequestData.data.travelRequestCount || 0} Requests`);
        } else {
          const text = await travelRequestRes.text();
          console.error('Expected JSON for travel requests, received:', text);
        }

        // Fetch total number of travel history (trips)
        const travelHistoryRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/accepted-travel-request-count/${employeeEmail}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const travelHistoryContentType = travelHistoryRes.headers.get('content-type');
        if (travelHistoryContentType && travelHistoryContentType.includes('application/json')) {
          const travelHistoryData = await travelHistoryRes.json();
          setTotalHistory(`${travelHistoryData.data.acceptedRequestCount || 0} Trips`);
        } else {
          const text = await travelHistoryRes.text();
          console.error('Expected JSON for travel history, received:', text);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Call the fetchData function
  }, [employeeEmail]); // Dependency on employeeEmail ensures this runs when the email is set

  const data = [
    {
      title: 'Latest Travel Request Status',
      value: latestTravelStatus,
      color: getStatusColor(latestTravelStatus), // Pass the color based on status
    },
    {
      title: 'Total Number of Travel Requests',
      value: totalRequests,
    },
    {
      title: 'Total Number of Approved Travel Request',
      value: totalHistory,
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Welcome, {employeeName || 'Employee'}! {/* Display employee name */}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard title={card.title} value={card.value} color={card.color} /> {/* Pass color to StatCard */}
          </Grid>
        ))}
      </Grid>

      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
      </Box>

      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 6, lg: 4 }}>
          <TravelRequestCard />
        </Grid>
        <Grid size={{ xs: 6, lg: 4 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <UpcomingTripsCard />
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
