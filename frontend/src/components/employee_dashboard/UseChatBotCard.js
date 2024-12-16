import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function UseChatBotCard({ onChatbotClick }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ height: 'auto', minHeight: 200 }}>  {/* Adjusted minHeight for a taller card */}
      <CardContent>
        <SmartToyIcon />  {/* Icon representing the AI */}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Use Voxia to Plan Your Travels!
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '50px' }}>
          Chat with Voxia, our AI assistant, to easily request your travel plans 
          and receive timely information on their progress.
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}  // Custom color with hover effect
          endIcon={<ChevronRightRoundedIcon />} // Icon on the right side
          fullWidth={isSmallScreen} // Dynamically set fullWidth for small screens
          onClick={onChatbotClick}  // Trigger the parent component's chatbot click handler
        >
          Try Voxia
        </Button>
      </CardContent>
    </Card>
  );
}
