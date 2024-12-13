import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation and detecting active route
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

const mainListItems = [
  { text: 'Dashboard', icon: <AnalyticsRoundedIcon />, path: '/admin_dashboard' },
  { text: 'Employees', icon: <PeopleRoundedIcon />, path: '/employee-details' },
  { text: 'Travel Requests', icon: <FlightTakeoff />, path: '/travel-requests' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/travel-reports'},
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon /> },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation(); // Detect the current path

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1 }}>
      {/* Company logo at the top */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, mb: 2 }}>
        <Box
          component="img"
          alt="Company Logo"
          src={require('../../assets/images/origtek-logo.png')} // Make sure this path is correct
          sx={{ width: 80, height: 'auto' }}
        />
      </Box>

      {/* Main menu items */}
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={location.pathname === item.path} // Highlight if current route matches
              onClick={() => handleNavigation(item.path)} // Navigate on click
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Spacer to push secondary items to the bottom */}
      <Box sx={{ flexGrow: 1 }} /> {/* This will take up remaining space */}

      {/* Secondary menu items */}
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={location.pathname === item.path} // Highlight if current route matches
              onClick={() => handleNavigation(item.path)} // Navigate on click
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
