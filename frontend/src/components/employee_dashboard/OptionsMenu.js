import * as React from 'react';
import { styled } from '@mui/material/styles';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MenuButton from './MenuButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

const OptionsMenu = React.memo(() => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = React.useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = React.useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    logout();
    handleClose();
    navigate('/signin');
  }, [logout, handleClose, navigate]);

  const handleProfile = React.useCallback(() => {
    navigate('/user_profile');  // Navigate to the profile page
    handleClose();
  }, [navigate, handleClose]);

  const menuItems = React.useMemo(() => [
    { label: 'Profile', onClick: handleProfile },
    { label: 'My account', onClick: handleClose },
    { type: 'divider' },
    { label: 'Add another account', onClick: handleClose },
    { label: 'Settings', onClick: handleClose },
    { type: 'divider' },
    { 
      label: 'Logout',
      onClick: handleLogout,
      icon: <LogoutRoundedIcon fontSize="small" />,
      sx: {
        [`& .${listItemIconClasses.root}`]: {
          ml: 'auto',
          minWidth: 0,
        },
      }
    }
  ], [handleClose, handleLogout]);

  return (
    <React.Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: 'transparent' }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: '4px',
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px',
          },
        }}
      >
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <Divider key={`divider-${index}`} />
          ) : (
            <MenuItem 
              key={item.label}
              onClick={item.onClick}
              sx={item.sx}
            >
              <ListItemText>{item.label}</ListItemText>
              {item.icon && (
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
              )}
            </MenuItem>
          )
        )}
      </Menu>
    </React.Fragment>
  );
});

OptionsMenu.displayName = 'OptionsMenu';
export default OptionsMenu;