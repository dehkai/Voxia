import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    TextField,
    Button,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

function Account() {
    const [user, setUser] = useState({
        username: '',
        email: '',
        role: '',
        gender: '',
        createdAt: '',
        jobTitle: '',
        preferences: { cabinClass: '', hotelRating: '' },
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5000/api/auth/profile', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    const formattedUser = {
                        ...data.user,
                        gender: data.user.gender
                            ? data.user.gender.charAt(0).toUpperCase() + data.user.gender.slice(1)
                            : '',
                        preferences: {
                            ...data.user.preferences,
                            cabinClass: data.user.preferences.cabinClass
                                ? data.user.preferences.cabinClass.charAt(0).toUpperCase() + data.user.preferences.cabinClass.slice(1)
                                : '',
                            hotelRating: data.user.preferences.hotelRating,
                        },
                    };
                    setUser(formattedUser);
                })
                .catch((error) => {
                    console.error('Error fetching user profile:', error);
                });
        }
    }, []);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    return (
        <AppTheme>
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '90vh',
                    textAlign: 'center',
                    mt: 4,
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h4" sx={{ mb: 4, textAlign: 'left' }}>
                        Profile
                    </Typography>
                    <Grid container spacing={4}>
                        {/* Left Side - Profile Card */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ textAlign: 'center', p: 2 }}>
                                <Avatar
                                    src="/static/images/avatar/7.jpg"
                                    alt={user.username}
                                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                                />
                                <Typography variant="h6">{user.username}</Typography>
                                <Typography color="textSecondary">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Typography>
                                <Typography color="textSecondary">{user.email}</Typography>
                            </Card>
                        </Grid>

                        {/* Right Side - Profile Forms */}
                        <Grid item xs={12} md={8}>
                            {/* Existing Profile Cards */}
                            <Card sx={{ mb: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                                        Profile
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textAlign: 'left' }}>
                                        The information can be edited
                                    </Typography>
                                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Full Name"
                                                    value={user.username}
                                                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email address"
                                                    type="email"
                                                    value={user.email}
                                                    readOnly
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Gender"
                                                    value={user.gender}
                                                    onChange={(e) => setUser({ ...user, gender: e.target.value })}
                                                >
                                                    <MenuItem value="">Select gender</MenuItem>
                                                    <MenuItem value="Male">Male</MenuItem>
                                                    <MenuItem value="Female">Female</MenuItem>
                                                </TextField>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Change Password Card */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                                        Change Password
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textAlign: 'left' }}>
                                        Update your account password below
                                    </Typography>
                                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Current Password"
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="New Password"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Confirm New Password"
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </AppTheme>
    );
}

export default Account;
