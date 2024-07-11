import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';

import avatar from 'src/assets/images/avatars/1.jpg';

const Profile = () => {
  const [userData, setUserData] = useState({
    id: 1,
    name: 'Profile',
    email: '',
    role: 'Admin',
    avatar: avatar, // Example avatar image
  });

  const handleEditClick = () => {
    // Handle edit button click, e.g., show edit form or navigate to edit page
    console.log('Edit button clicked');
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <CCard className="w-50">
        <CCardHeader>
          <div className="d-flex align-items-center">
            <CIcon icon={cilUser} className="mr-2" height={24} />
            Profile
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="text-center mb-4">
            <img src={userData.avatar} className="rounded-circle" height="128" alt="User Avatar" />
            <div className="mt-3">
              <h5 className="mb-1">{userData.name}</h5>
              <p className="text-muted mb-1">{userData.email}</p>
              <p className="text-muted mb-0">{userData.role}</p>
            </div>
          </div>
          <form className="mx-4">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder={userData.email}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="*********" // Example: Display masked password or provide a change option
              />
            </div>
            <div className="d-grid gap-2">
              <CButton color="primary" onClick={handleEditClick}>Edit Profile</CButton>
            </div>
          </form>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Profile;
