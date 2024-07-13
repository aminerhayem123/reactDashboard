import React, { useState, useEffect } from 'react';
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
    email: '', // Initialize email state
    role: 'Admin',
    avatar: avatar, // Example avatar image
  });

  // State for form inputs
   const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Fetch initial user data or set default values
    fetchUserData();
  }, []);

  // Function to fetch user data (optional)
  const fetchUserData = () => {
    // Replace with actual fetch logic if needed
    setUserData({
      ...userData,
      email: 'example@email.com', // Example initial email
    });
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Function to handle edit button click
  const handleEditClick = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser); // Update user data in state
        console.log('User updated successfully:', updatedUser);
        localStorage.removeItem('authToken'); // Remove token from localStorage
        window.location.reload(); // Refresh the page
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="*********" // Example: Display masked password or provide a change option
                value={formData.password}
                onChange={handleInputChange}
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
