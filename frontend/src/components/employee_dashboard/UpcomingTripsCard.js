import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function TravelRequestReportsCard() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigate = () => {
    navigate('/upcoming-trips'); // Navigate to TravelRequestPage.js route
  };

  return (
    <Card sx={{ height: 'auto', minHeight: 200 }}>  {/* Adjusted minHeight for a taller card */}
      <CardContent>
        <HistoryIcon />  {/* Icon representing history */}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Your Upcoming Trips
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '50px' }}>
        Don't forget, your upcoming trip is just around the corner—check all the details to ensure you're ready!
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />} // Icon on the right side
          fullWidth={isSmallScreen} // Dynamically set fullWidth for small screens
          onClick={handleNavigate}
        >
          View Upcoming Trips
        </Button>
      </CardContent>
    </Card>
  );
}
