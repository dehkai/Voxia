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

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState([]); // Initialize rows state to hold the fetched data
  const [loading, setLoading] = React.useState(true); // Loading state to handle loading status
  const [open, setOpen] = React.useState(false); // State to control modal
  const [selectedRequest, setSelectedRequest] = React.useState(null); // Track selected travel request

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
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'request_number', headerName: 'Request Number', minWidth: 150, flex: 1 },
    { field: 'type', headerName: 'Type', minWidth: 120, flex: 1 },
    { field: 'total_cost', headerName: 'Total Cost (RM)', minWidth: 150, flex: 1 },
    {
      field: 'details',
      headerName: 'Details',
      minWidth: 200,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => handleOpenModal(params.row)}>
          View Details
        </Button>
      ),
    },
    { 
        field: 'status', 
        headerName: 'Status', 
        flex: 1,  // Set flex property for the Status column as well
        renderCell: (params) => {
          // Determine the color based on the status
          let statusColor = '';
          if (params.value === 'pending') {
            statusColor = 'orange';  // Use orange for pending
          } else if (params.value === 'approved') {
            statusColor = 'green';  // Use green for approved
          } else if (params.value === 'rejected') {
            statusColor = 'red';  // Use red for rejected
          }
  
          // Return the status with the appropriate text color
          return (
            <div style={{
              color: statusColor,  // Apply text color
              fontWeight: 'bold',   // Optional: Make text bold
            }}>
              {params.value}
            </div>
          );
        },
      },  ];

  // Fetch data from the API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/travel-requests`);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Fetched Data:', data);

        const formattedRows = data.data.travelRequests.map((request, index) => ({
          id: index + 1,
          request_number: request.request_number,
          type: request.type,
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
          status: request.status,
        }));

        setRows(formattedRows);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching travel requests:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <Typography>Origin: {selectedRequest.origin_city} ({selectedRequest.origin_airport_code})</Typography>
              <Typography>Destination: {selectedRequest.destination_city} ({selectedRequest.destination_airport_code})</Typography>
              <Typography>Airline: {selectedRequest.outbound_airline}</Typography>
              <Typography>Flight Number: {selectedRequest.outbound_flight_number}</Typography>
              <Typography>Cabin Class: {selectedRequest.cabin_class}</Typography>
              <Typography>Departure: {selectedRequest.departure_datetime}</Typography>
              <Typography>Arrival: {selectedRequest.arrival_datetime}</Typography>
              <Typography>Duration: {selectedRequest.flight_duration}</Typography>
              <Typography>Flight Price: ${selectedRequest.flight_price}</Typography>
              <br />
              <Typography variant="h6">Hotel Info</Typography>
              <Typography>Hotel: {selectedRequest.hotel_name} ({selectedRequest.hotel_city})</Typography>
              <Typography>Room Type: {selectedRequest.room_type}</Typography>
              <Typography>Check-In: {selectedRequest.check_in}</Typography>
              <Typography>Check-Out: {selectedRequest.check_out}</Typography>
              <Typography>Nights: {selectedRequest.nights}</Typography>
              <Typography>Price per Night: ${selectedRequest.price_per_night}</Typography>
              <Typography>Total Hotel Price: ${selectedRequest.total_hotel_price}</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
