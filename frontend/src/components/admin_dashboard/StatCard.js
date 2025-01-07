import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function StatCard({ title, value }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography
          component="h2"
          variant="h6"
          sx={{ marginBottom: 4 }}
        >
          {title}
        </Typography>
        <Box sx={{ justifyContent: 'space-between', flexGrow: 1, gap: 1 }}>
          <Box direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h2" component="p">
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default StatCard;
