import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CInputGroup,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';

import avatar from 'src/assets/images/avatars/1.jpg';

const Profile = () => {
  // Example user data
  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    avatar: avatar, // Example avatar image
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <div className="d-flex align-items-center">
          <CIcon icon={cilUser} className="mr-2" height={24} />
          Profile
        </div>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex align-items-center mb-4">
          <img src={user.avatar} className="rounded-circle mr-3" height="64" alt="User Avatar" />
          <div>
            <h5 className="mb-1">{user.name}</h5>
            <p className="text-muted mb-1">{user.email}</p>
            <p className="text-muted mb-0">{user.role}</p>
          </div>
        </div>

        {/* Additional profile details */}
        <div className="mb-3">
          <strong>ID:</strong> {user.id}
        </div>

        {/* Example action button */}
        <CButton color="primary" className="mr-2">
          Edit Profile
        </CButton>
        <CButton color="danger">
          Delete Account
        </CButton>
      </CCardBody>
    </CCard>
  );
};

export default Profile;