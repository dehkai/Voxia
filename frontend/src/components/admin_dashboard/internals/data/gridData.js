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

// Render status with color using Chip component
function renderStatus(params) {
  if (!params.value) return null;

  const statusColors = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'error',
  };

  return (
    <Chip
      label={params.value}
      color={statusColors[params.value] || 'default'}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
}

// Updated columns with hardcoded row numbers and status
export const columns = [
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
    field: 'status',  // New status column
    headerName: 'Status',
    flex: 1,
    minWidth: 120,
    renderCell: renderStatus,
  },
];

// Example rows for the table with hardcoded row numbers and status
export const rows = [
  {
    id: 1,
    name: 'John Doe',
    employeeId: 'EMP001',
    destination: 'New York',
    startDate: '2024-12-10',
    endDate: '2024-12-15',
    amountRequested: 1200,
    requestType: 'Conference',
    status: 'Approved',  // Status value
  },
  {
    id: 2,
    name: 'Jane Smith',
    employeeId: 'EMP002',
    destination: 'London',
    startDate: '2024-12-15',
    endDate: '2024-12-18',
    amountRequested: 1500,
    requestType: 'Business',
    status: 'Pending',  // Status value
  },
  {
    id: 3,
    name: 'Robert Brown',
    employeeId: 'EMP003',
    destination: 'Tokyo',
    startDate: '2024-12-20',
    endDate: '2024-12-27',
    amountRequested: 2200,
    requestType: 'Business',
    status: 'Rejected',  // Status value
  },
  {
    id: 4,
    name: 'Emily Davis',
    employeeId: 'EMP004',
    destination: 'Paris',
    startDate: '2024-12-22',
    endDate: '2024-12-26',
    amountRequested: 1800,
    requestType: 'Conference',
    status: 'Approved',  // Status value
  },
  {
    id: 5,
    name: 'Michael Lee',
    employeeId: 'EMP005',
    destination: 'Berlin',
    startDate: '2024-12-18',
    endDate: '2024-12-20',
    amountRequested: 1000,
    requestType: 'Business',
    status: 'Pending',  // Status value
  },
];
