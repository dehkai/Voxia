import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

// Helper function to generate dates for the sparkline chart
function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params) {
  const data = getDaysInMonth(12, 2024); // December 2024 dates
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

// Updated columns with hardcoded row numbers, Status, and Action columns
export const columns = [
  {
    field: 'rowNumber',
    headerName: '#',  // Hardcoded row number column
    width: 50,
  },
  { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 200 },
  {
    field: 'employeeId',
    headerName: 'Employee ID',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'destination',
    headerName: 'Destination',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'amountRequested',
    headerName: 'Amount Requested',
    flex: 1,
    minWidth: 150,
    headerAlign: 'right',
    align: 'right',
    type: 'number',
  },
  {
    field: 'requestType',
    headerName: 'Request Type',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const status = params.value;
      let color = 'gray';
      if (status === 'Approved') {
        color = 'green';
      } else if (status === 'Pending') {
        color = 'orange';
      } else if (status === 'Rejected') {
        color = 'red';
      }
      return <Chip label={status} color={color} size="small" />;
    },
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      return (
        <div>
          <button style={{ marginRight: '5px' }}>View</button>
          <button>Approve</button>
        </div>
      );
    },
  },
];

// Example rows for the table with hardcoded row numbers, Status, and Action columns
export const rows = [
  {
    id: 1,
    rowNumber: 1, // Hardcoded row number
    name: 'John Doe',
    employeeId: 'EMP001',
    destination: 'New York',
    startDate: '2024-12-10',
    endDate: '2024-12-15',
    amountRequested: 1200,
    requestType: 'Conference',
    status: 'Approved', // Hardcoded status
  },
  {
    id: 2,
    rowNumber: 2, // Hardcoded row number
    name: 'Jane Smith',
    employeeId: 'EMP002',
    destination: 'London',
    startDate: '2024-12-15',
    endDate: '2024-12-18',
    amountRequested: 1500,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 3,
    rowNumber: 3, // Hardcoded row number
    name: 'Robert Brown',
    employeeId: 'EMP003',
    destination: 'Tokyo',
    startDate: '2024-12-20',
    endDate: '2024-12-27',
    amountRequested: 2200,
    requestType: 'Business',
    status: 'Rejected', // Hardcoded status
  },
  {
    id: 4,
    rowNumber: 4, // Hardcoded row number
    name: 'Emily Davis',
    employeeId: 'EMP004',
    destination: 'Paris',
    startDate: '2024-12-22',
    endDate: '2024-12-26',
    amountRequested: 1800,
    requestType: 'Conference',
    status: 'Approved', // Hardcoded status
  },
  {
    id: 5,
    rowNumber: 5, // Hardcoded row number
    name: 'Michael Lee',
    employeeId: 'EMP005',
    destination: 'Berlin',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 1000,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 6,
    rowNumber: 6, // Hardcoded row number
    name: 'Sarah Johnson',
    employeeId: 'EMP006',
    destination: 'Abu Dhabi',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 3200,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 7,
    rowNumber: 7, // Hardcoded row number
    name: 'David Turner',
    employeeId: 'EMP007',
    destination: 'Berlin',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 1000,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 8,
    rowNumber: 8, // Hardcoded row number
    name: 'Linda Harris',
    employeeId: 'EMP008',
    destination: 'London',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 4000,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 9,
    rowNumber: 9, // Hardcoded row number
    name: 'James Wilson',
    employeeId: 'EMP009',
    destination: 'Bangkok',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 2500,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
  {
    id: 10,
    rowNumber: 10, // Hardcoded row number
    name: 'Emily Davis',
    employeeId: 'EMP010',
    destination: 'Kuala Lumpur',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 3500,
    requestType: 'Business',
    status: 'Pending', // Hardcoded status
  },
];
