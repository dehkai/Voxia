import * as React from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/admin_dashboard/AppNavbar';
import Header from '../components/admin_dashboard/Header';
import Typography from '@mui/material/Typography';
import TravelReportsTable from '../components/admin_dashboard/TravelRequestTable';
import SideMenu from '../components/admin_dashboard/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../shared-theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin");
    }
  }, [isLoggedIn, navigate]);

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <Typography
              component="h2"
              variant="h6"
              sx={{
                mb: 2,
                alignSelf: 'flex-start', // Aligns the text to the left
              }}
            >
              Employees' Travel Request
            </Typography>
            <TravelReportsTable />
            
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
});

Dashboard.displayName = 'AdminDashboard';
export default Dashboard;