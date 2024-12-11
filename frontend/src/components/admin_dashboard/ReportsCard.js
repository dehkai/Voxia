import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AssignmentIcon from '@mui/icons-material/Assignment';  // Updated icon for reports
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function TravelRequestReportsCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ height: 'auto', minHeight: 200 }}>  {/* Adjusted minHeight for a taller card */}
      <CardContent>
        <AssignmentIcon />  {/* Icon representing reports */}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          View Travel Request Reports
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '50px' }}>
          Access reports on employee travel requests, including trip details and expenses.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
        >
          View Reports
        </Button>
      </CardContent>
    </Card>
  );
}
