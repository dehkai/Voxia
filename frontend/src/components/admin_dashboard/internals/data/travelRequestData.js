export const requestColumns = [
  { field: 'name', headerName: 'Employee Name', width: 180 },
  { field: 'employeeId', headerName: 'Employee ID', width: 130 },
  { field: 'destination', headerName: 'Destination', width: 180 },
  { field: 'travelDate', headerName: 'Travel Date', width: 150 },
  { field: 'reportStatus', headerName: 'Report Status', width: 150 },
  { field: 'amountSpent', headerName: 'Amount Spent', width: 150, type: 'number' },
  {
    field: 'action',
    headerName: 'Action',
    width: 150,
    renderCell: (params) => (
      <div>
        <button
          style={{
            marginRight: '5px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Approve
        </button>
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Reject
        </button>
      </div>
    ),
  },
];

export const requestRows = [
  {
    id: 1,
    name: 'John Doe',
    employeeId: 'EMP001',
    destination: 'New York',
    travelDate: '2024-12-10',
    reportStatus: 'Pending',
    amountSpent: 1200,
  },
  {
    id: 2,
    name: 'Jane Smith',
    employeeId: 'EMP002',
    destination: 'London',
    travelDate: '2024-12-15',
    reportStatus: 'Approved',
    amountSpent: 1500,
  },
  {
    id: 3,
    name: 'Robert Brown',
    employeeId: 'EMP003',
    destination: 'Tokyo',
    travelDate: '2024-12-20',
    reportStatus: 'Pending',
    amountSpent: 2200,
  },
  {
    id: 4,
    name: 'Emily Davis',
    employeeId: 'EMP004',
    destination: 'Paris',
    travelDate: '2024-12-22',
    reportStatus: 'Rejected',
    amountSpent: 1800,
  },
  {
    id: 5,
    name: 'Michael Lee',
    employeeId: 'EMP005',
    destination: 'Berlin',
    travelDate: '2024-12-18',
    reportStatus: 'Pending',
    amountSpent: 1000,
  },
  {
    id: 6,
    name: 'Sarah Johnson',
    employeeId: 'EMP006',
    destination: 'Abu Dhabi',
    travelDate: '2024-12-18',
    reportStatus: 'Approved',
    amountSpent: 3200,
  },
  {
    id: 7,
    name: 'David Turner',
    employeeId: 'EMP007',
    destination: 'Berlin',
    travelDate: '2024-12-18',
    reportStatus: 'Pending',
    amountSpent: 1000,
  },
  {
    id: 8,
    name: 'Linda Harris',
    employeeId: 'EMP008',
    destination: 'London',
    travelDate: '2024-12-18',
    reportStatus: 'Approved',
    amountSpent: 4000,
  },
  {
    id: 9,
    name: 'James Wilson',
    employeeId: 'EMP009',
    destination: 'Bangkok',
    travelDate: '2024-12-18',
    reportStatus: 'Rejected',
    amountSpent: 2500,
  },
  {
    id: 10,
    name: 'Emily Davis',
    employeeId: 'EMP010',
    destination: 'Kuala Lumpur',
    travelDate: '2024-12-18',
    reportStatus: 'Approved',
    amountSpent: 3500,
  },
];

