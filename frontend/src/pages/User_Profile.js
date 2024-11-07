import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Avatar, TextField, Button, MenuItem } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';



function Account() {
    const [user, setUser] = useState({ username: '', email: '', role: ''});

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
                setUser(data.user); 
            })
            .catch((error) => {
                console.error('Error fetching user profile:', error);
            });
        }
    }, []);
    return (
        
        <Container maxWidth="md">
            <AppTheme>
            <Typography variant="h4" sx={{ mb: 4 }}>
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
                        <Typography color="textSecondary">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Typography>
                        <Typography color="textSecondary">{user.email}</Typography>
                        {/* <Button color="primary" variant="text" sx={{ mt: 2 }}>
                            Upload picture
                        </Button> */}
                    </Card>
                </Grid>

                {/* Right Side - Profile Form */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Profile
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                The information can be edited
                            </Typography>
                            <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First name"
                                            defaultValue="Sofia"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last name"
                                            defaultValue="Rivers"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email address"
                                            type="email"
                                            defaultValue={user.email}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Phone number"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="State"
                                            defaultValue=""
                                        >
                                            <MenuItem value="">Select state</MenuItem>
                                            <MenuItem value="CA">California</MenuItem>
                                            {/* Add more states as needed */}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3 }}
                                >
                                    Save details
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            </AppTheme>
        </Container>
    );
}

export default Account;
