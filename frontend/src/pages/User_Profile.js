import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Avatar, TextField, Button, MenuItem } from '@mui/material';

// Sample data for avatar and user info
const user = {
    name: 'Sofia Rivers',
    location: 'Los Angeles USA',
    timezone: 'GTM-7',
    email: 'sofia@devias.io',
};

function Account() {
    return (
        <Container maxWidth="md">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Account
            </Typography>
            <Grid container spacing={4}>
                {/* Left Side - Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                        <Avatar
                            src="https://via.placeholder.com/150"
                            alt={user.name}
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        />
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography color="textSecondary">{user.location}</Typography>
                        <Typography color="textSecondary">{user.timezone}</Typography>
                        <Button color="primary" variant="text" sx={{ mt: 2 }}>
                            Upload picture
                        </Button>
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
        </Container>
    );
}

export default Account;
