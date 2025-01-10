import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState([]);  // Initialize rows state to hold the fetched data
  const [loading, setLoading] = React.useState(true);  // Loading state to handle loading status

  // Define the columns for DataGrid
  const columns = [
    { field: 'id', headerName: 'Request ID', width: 100 },  // Set flex property for auto width
    { field: 'request_number', headerName: 'Request Number', flex: 1 },
    { field: 'total_cost', headerName: 'Total Cost', flex: 1 },
    { field: 'city', headerName: 'Destination', flex: 1 },
    { field: 'nights', headerName: 'Nights', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,  // Set flex property for the Status column as well
      renderCell: (params) => {
        // Determine the color based on the status
        let statusColor = '';
        if (params.value === 'PENDING') {
          statusColor = 'orange';  // Use orange for pending
        } else if (params.value === 'APPROVED') {
          statusColor = 'green';  // Use green for approved
        } else if (params.value === 'REJECTED') {
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
    },
  ];

  // Fetch data from the API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch travel requests data
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/travel-requests`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log("Fetched Data:", data);  // Log the raw response data

        // Map the response data to match the grid structure
        const formattedRows = data.data.travelRequests.map((request, index) => ({
          id: index + 1,  // Add an incremental ID for each row
          request_number: request.request_number,
          total_cost: request.total_cost,
          city: request.flight_details.destination.city,
          nights: request.hotel_details.nights,
          status: request.status.toUpperCase(),
        }));

        console.log("Formatted Rows:", formattedRows);  // Log the formatted rows

        setRows(formattedRows);  // Set the fetched data into rows state
        setLoading(false);  // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching travel requests:', error);
        setLoading(false);  // Set loading to false even if there's an error
      }
    };

    fetchData();
  }, []);  // Empty dependency array ensures this runs once when the component mounts

  return (
    <div style={{ height: 270, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}  // Display a loading state while data is being fetched
        pageSize={2}  // Limit the number of rows per page to 2
        rowsPerPageOptions={[2]}  // Only allow 2 rows per page
        pagination  // Enable pagination
      />
    </div>
  );
}
