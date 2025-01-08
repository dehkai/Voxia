import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function EmployeeDetailsTable() {
  const [rows, setRows] = React.useState([]);  // Initialize rows state to hold the fetched data
  const [loading, setLoading] = React.useState(true);  // Loading state to handle loading status

  // Define the columns for DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 1 },
    { field: 'jobTitle', headerName: 'Job Title', flex: 1 },
    { field: 'cabinClass', headerName: 'Preffered Cabin Class', flex: 1 },
    { field: 'hotelRating', headerName: 'Preferred Hotel Rating', flex: 1 },
  ];

  // Fetch data from the API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch travel requests data
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/employees`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log("Fetched Data:", data);  // Log the raw response data

        // Map the response data to match the grid structure
        const formattedRows = data.data.employees.map((employee, index) => ({
          id: index + 1,  // Add an incremental ID for each row
          username: employee.username,
          email: employee.email,
          gender: employee.gender,
          jobTitle: employee.jobTitle,
          cabinClass: employee.preferences.cabinClass,
          hotelRating: employee.preferences.hotelRating,
        }));

        console.log("Formatted Rows:", formattedRows);  // Log the formatted rows

        setRows(formattedRows);  // Set the fetched data into rows state
        setLoading(false);  // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setLoading(false);  // Set loading to false even if there's an error
      }
    };

    fetchData();
  }, []);  // Empty dependency array ensures this runs once when the component mounts

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}  // Display a loading state while data is being fetched
        pageSize={5}  // Limit the number of rows per page to 5
        rowsPerPageOptions={[5]}  // Only allow 5 rows per page
        pagination  // Enable pagination
      />
    </div>
  );
}
