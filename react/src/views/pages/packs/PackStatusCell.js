import React from 'react';
import { CTableDataCell } from '@coreui/react';

const PackStatusCell = ({ status }) => {
  // Determine the color based on status
  const cellStyle = {
    color: status === 'Sold' ? 'green' : 'red',
  };

  return (
    <CTableDataCell style={cellStyle}>
      {status || 'Not Sold'}
    </CTableDataCell>
  );
};

export default PackStatusCell;
