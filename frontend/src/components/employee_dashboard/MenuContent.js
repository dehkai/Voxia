import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation and detecting active route
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import HistoryIcon from '@mui/icons-material/History';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, path: '/employee_dashboard' },
  { text: 'My Travel Requests', icon: <FlightTakeoff />, path: '/travel-requests' },
  { text: 'My Travel History', icon: <HistoryIcon />, path: '/travel-history' },
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
          src={require('../../assets/images/origtek-logo.png')}
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

    </Stack>
  );
}
