import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { reportRows as rows, reportColumns as columns } from './internals/data/travelReportsData'; // Updated import names

export default function TravelReportsTable() {
  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 15]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
}
