import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AssignmentIcon from '@mui/icons-material/Assignment';  // Updated icon for reports
import { useNavigate } from 'react-router-dom';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import PeopleIcon from '@mui/icons-material/People';  // Updated icon
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HighlightedCard() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigate = () => {
    navigate('/travel-requests'); // Navigate to TravelRequests.js route
  };

  return (
    <Card sx={{ height: 'auto', minHeight: 200 }}>  {/* Adjusted minHeight for a taller card */}
      <CardContent>
        <FlightTakeoff />  {/* Icon representing reports */}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          View Your Travel Requests
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '50px' }}>
        View detailed information about your personal travel requests and their status.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />} // Icon on the right side
          fullWidth={isSmallScreen} // Dynamically set fullWidth for small screens
          onClick={handleNavigate}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
