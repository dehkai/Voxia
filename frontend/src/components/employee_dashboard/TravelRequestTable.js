import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

export default function TravelRequestTable() {
  const [rows, setRows] = React.useState([]); // Hold fetched travel request data
  const [loading, setLoading] = React.useState(true); // Loading state for fetching data
  const [open, setOpen] = React.useState(false); // Modal state for viewing details
  const [selectedRequest, setSelectedRequest] = React.useState(null); // Track selected travel request
  const [employeeEmail, setEmployeeEmail] = React.useState(''); // State for employee email

  const handleOpenModal = (row) => {
    setSelectedRequest(row);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedRequest(null);
  };

  // Define the columns for DataGrid
  const columns = [
    { field: 'count', headerName: 'No.', width: 80 },
    { field: 'id', headerName: 'Request ID', width: 100 },
    { field: 'user_email', headerName: 'Email', width: 200 },
    { field: 'request_number', headerName: 'Request Number', minWidth: 150, flex: 1 },
    { field: 'total_cost', headerName: 'Total Cost (RM)', minWidth: 100, flex: 1 },
    {
      field: 'details',
      headerName: 'Details',
      minWidth: 180,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => handleOpenModal(params.row)}>
          View Details
        </Button>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params) => {
        let statusColor = '';
        if (params.value === 'PENDING') {
          statusColor = 'orange';
        } else if (params.value === 'APPROVED') {
          statusColor = 'green';
        } else if (params.value === 'REJECTED') {
          statusColor = 'red';
        }

        return (
          <div style={{ color: statusColor, fontWeight: 'bold' }}>
            {params.value}
          </div>
        );
      },
    },
  ];

  // First useEffect: Fetch employee profile and set email
  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      try {
        // Fetch employee profile
        const profileRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileContentType = profileRes.headers.get('content-type');
        if (profileContentType && profileContentType.includes('application/json')) {
          const profileData = await profileRes.json();
          setEmployeeEmail(profileData.user.email); // Set the employee email after fetching profile data
        } else {
          const text = await profileRes.text();
          console.error('Expected JSON for profile, received:', text);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Second useEffect: Fetch travel requests once employee email is available
  React.useEffect(() => {
    const fetchTravelRequests = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!employeeEmail) return; // Wait until employeeEmail is set

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/travel-requests/${employeeEmail}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch travel requests');
        }

        const data = await response.json();
        const formattedRows = data.data.travelRequests.map((request, index) => ({
          id: index + 1,
          _id: request._id,
          user_email: request.user_email,
          request_number: request.request_number,
          total_cost: request.total_cost,
          origin_city: request.flight_details.origin.city,
          origin_airport_code: request.flight_details.origin.airport_code,
          destination_city: request.flight_details.destination.city,
          destination_airport_code: request.flight_details.destination.airport_code,
          outbound_airline: request.flight_details.outbound_flight.airline,
          outbound_flight_number: request.flight_details.outbound_flight.flight_number,
          cabin_class: request.flight_details.outbound_flight.cabin_class,
          departure_datetime: request.flight_details.outbound_flight.departure_datetime,
          arrival_datetime: request.flight_details.outbound_flight.arrival_datetime,
          flight_duration: request.flight_details.outbound_flight.duration,
          flight_price: request.flight_details.outbound_flight.price,
          hotel_name: request.hotel_details.hotel_name,
          hotel_city: request.hotel_details.city,
          room_type: request.hotel_details.room_type,
          check_in: request.hotel_details.check_in,
          check_out: request.hotel_details.check_out,
          nights: request.hotel_details.nights,
          price_per_night: request.hotel_details.price_per_night,
          total_hotel_price: request.hotel_details.total_price,
          rating: request.hotel_details.rating,
          status: request.status.toUpperCase(),
        }));

        // Sort by status (PENDING first, then APPROVED, then REJECTED)
        const sortedRows = [
          ...formattedRows.filter((row) => row.status === 'PENDING'),
          ...formattedRows.filter((row) => row.status === 'APPROVED'),
          ...formattedRows.filter((row) => row.status === 'REJECTED'),
        ];

        // Assign a count to each row based on the sorted order
        const rowsWithCount = sortedRows.map((row, index) => ({
          ...row,
          count: index + 1,
        }));

        setRows(rowsWithCount);
      } catch (error) {
        console.error('Error fetching travel requests:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeEmail) {
      fetchTravelRequests();
    }
  }, [employeeEmail]);

  return (
    <div style={{ height: 500, width: '100%', overflowX: 'auto' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5]}
        pagination
        autoHeight
      />

      {selectedRequest && (
        <Dialog open={open} onClose={handleCloseModal} fullWidth>
          <DialogTitle>Travel Request Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Typography variant="h6">Flight Info</Typography>
              <Typography>
                Origin: {selectedRequest.origin_city} ({selectedRequest.origin_airport_code})
              </Typography>
              <Typography>
                Destination: {selectedRequest.destination_city} ({selectedRequest.destination_airport_code})
              </Typography>
              <Typography>Airline: {selectedRequest.outbound_airline}</Typography>
              <Typography>Flight Number: {selectedRequest.outbound_flight_number}</Typography>
              <Typography>Cabin Class: {selectedRequest.cabin_class}</Typography>
              <Typography>Departure: {selectedRequest.departure_datetime}</Typography>
              <Typography>Arrival: {selectedRequest.arrival_datetime}</Typography>
              <Typography>Duration: {selectedRequest.flight_duration}</Typography>
              <Typography>Flight Price: RM{selectedRequest.flight_price}</Typography>
              <br />
              <Typography variant="h6">Hotel Info</Typography>
              <Typography>Hotel: {selectedRequest.hotel_name} ({selectedRequest.hotel_city})</Typography>
              <Typography>Room Type: {selectedRequest.room_type}</Typography>
              <Typography>Check-In: {selectedRequest.check_in}</Typography>
              <Typography>Check-Out: {selectedRequest.check_out}</Typography>
              <Typography>Nights: {selectedRequest.nights}</Typography>
              <Typography>Rating: {selectedRequest.rating}</Typography>
              <Typography>Price per Night: RM{selectedRequest.price_per_night}</Typography>
              <Typography>Total Hotel Price: RM{selectedRequest.total_hotel_price}</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
