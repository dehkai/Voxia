import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';  // Updated icon
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HighlightedCard() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigate = () => {
    navigate('/employee-details'); // Navigate to TravelRequestPage.js route
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <PeopleIcon />  {/* Updated icon to match employee-related content */}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          View Employee Details
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          Access detailed information about employees, their roles, and performance.
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
