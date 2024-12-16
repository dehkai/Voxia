import React from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const NavbarBreadcrumbs = () => {
  const location = useLocation();

  // Define custom names for breadcrumbs
  const breadcrumbNameMap = {
    'admin_dashboard': 'Dashboard',
    'travel-requests': 'Dashboard > Travel Requests',
    'employee-details': 'Dashboard > Employee Details',
    'travel-reports': 'Dashboard > Travel Reports',
  };

  // Get breadcrumb items based on the current route
  const breadcrumbs = location.pathname.split('/').filter(Boolean);

  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
      {breadcrumbs.map((crumb, index) => {
        // Get the custom breadcrumb name or fallback to capitalizing the path
        const breadcrumbLabel = breadcrumbNameMap[crumb] || crumb.charAt(0).toUpperCase() + crumb.slice(1);
        
        return (
          <Typography key={index} variant="body1">
            {breadcrumbLabel}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
};

export default NavbarBreadcrumbs;
