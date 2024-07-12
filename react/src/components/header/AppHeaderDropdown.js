import React from 'react';
import { Link } from 'react-router-dom';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import {
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

import avatar8 from './../../assets/images/avatars/8.jpg';

const AppHeaderDropdown = () => {
  const handleLogout = () => {
    // Perform logout actions, e.g., clear local storage, update state
    localStorage.removeItem('authToken'); // Remove token from localStorage
    // Redirect or handle other logic as needed after logout
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem as={Link} to="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem as={Link} to="/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} as={Link} to="/login">
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
