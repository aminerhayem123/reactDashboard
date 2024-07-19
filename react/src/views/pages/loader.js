import React from 'react';
import { CSpinner } from '@coreui/react';

const Loader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CSpinner color="primary" />
    </div>
  );
  

export default Loader;
