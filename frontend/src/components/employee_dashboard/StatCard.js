import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function StatCard({ title, value, color }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack direction="column" sx={{ justifyContent: 'space-between', flexGrow: 1, gap: 1 }}>
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="h4"
                component="p"
                style={{ color: color}}
              >
                {value}
              </Typography>
              
            </Stack>
          </Stack>
          {/* Simplified summary statement */}
          <Typography variant="body2">
        Your {title} is{' '}
        <Typography
            component="span"
            sx={{
              color: value === 'PENDING' ? 'orange' : value === 'APPROVED' ? 'green' : value === 'REJECTED' ? 'red' : 'black',
              fontWeight: 'bold', // Optional: Make the value bold
            }}
        >
            {value}
        </Typography>.
</Typography>

        </Stack>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default StatCard;
