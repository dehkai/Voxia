import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, TextField, Button, MenuItem, Snackbar, Alert } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import AdminSideMenu from '../components/admin_dashboard/SideMenu';
import EmployeeSideMenu from '../components/employee_dashboard/SideMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import AppNavbar from '../components/admin_dashboard/AppNavbar';
import Header from '../components/admin_dashboard/Header';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/signin");
        } else {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => response.json())
                .then((data) => {
                    const formattedUser = {
                        ...data.user,
                        gender: data.user.gender ? data.user.gender.charAt(0).toUpperCase() + data.user.gender.slice(1) : "",
                        preferences: {
                            ...data.user.preferences,
                            cabinClass: data.user.preferences.cabinClass ? data.user.preferences.cabinClass.charAt(0).toUpperCase() + data.user.preferences.cabinClass.slice(1) : "",
                        },
                    };
                    setUser(formattedUser);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching user profile:', error);
                    setLoading(false);
                });
            }
        }
    }, [isLoggedIn, navigate]);

    const handleSaveDetails = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Profile updated successfully:', data);
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AppTheme>
            <Box sx={{ display: 'flex' }}>
                 {/* Conditional Sidebar */}
                 {user && user.role === 'admin' ? <AdminSideMenu /> : <EmployeeSideMenu />}
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
                                alignSelf: 'flex-start',
                            }}
                        >
                            User Profile
                        </Typography>

                        <Grid container>
                            {/* Left Side - Profile Card */}
                            <Grid item xs={11} md={4}  sx={{ marginRight: 2 }}>
                                <Card sx={{ textAlign: 'center', p: 14.1 }}>
                                    <Avatar
                                        src="/static/images/avatar/7.jpg"
                                        alt={user?.username || 'N/A'}
                                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                                    />
                                    <Typography variant="h6">{user?.username || 'N/A'}</Typography>
                                    <Typography color="textSecondary">{user.role.charAt(0).toUpperCase() + user.role.slice(1) || 'N/A'}</Typography>
                                    <Typography color="textSecondary">{user?.email || 'N/A'}</Typography>
                                </Card>
                            </Grid>

                            {/* Right Side - Profile Form */}
                            <Grid item xs={11} md={7}>
                                <Card sx={{ mb: 1.5 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                                            Profile
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textAlign: 'left' }}>
                                            You can edit your details here
                                        </Typography>
                                        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Full Name"
                                                        value={user?.username || ''}
                                                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email address"
                                                        type="email"
                                                        value={user?.email || ''}
                                                        readOnly
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Gender"
                                                        value={user?.gender || ''}
                                                        onChange={(e) => setUser({ ...user, gender: e.target.value })}
                                                    >
                                                        <MenuItem value="">Select gender</MenuItem>
                                                        <MenuItem value="Male">Male</MenuItem>
                                                        <MenuItem value="Female">Female</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Joined Date"
                                                        value={user?.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : ''}
                                                        readOnly
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Job Title"
                                                        value={user?.jobTitle || ''}
                                                        readOnly
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Preferences Form */}
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                                            Preferences
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textAlign: 'left' }}>
                                            You can edit your travel preferences here
                                        </Typography>
                                        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Cabin Class"
                                                        value={user?.preferences?.cabinClass || ''}
                                                        onChange={(e) => setUser({ ...user, preferences: { ...user.preferences, cabinClass: e.target.value } })}
                                                    >
                                                        <MenuItem value="">Select Cabin Class</MenuItem>
                                                        <MenuItem value="Economy">Economy</MenuItem>
                                                        <MenuItem value="Business">Business</MenuItem>
                                                        <MenuItem value="First Class">First Class</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Hotel Rating"
                                                        value={user?.preferences?.hotelRating || ''}
                                                        onChange={(e) => setUser({ ...user, preferences: { ...user.preferences, hotelRating: e.target.value } })}
                                                    >
                                                        <MenuItem value="">Select Hotel Rating</MenuItem>
                                                        {[1, 2, 3, 4, 5].map((rating) => (
                                                            <MenuItem key={rating} value={rating}>
                                                                {`${rating} Star`}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Save Button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button variant="contained" color="primary" onClick={handleSaveDetails}>
                                        Save Details
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Snackbar for success message */}
                        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                                Profile updated successfully!
                            </Alert>
                        </Snackbar>
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}

export default UserProfile;
