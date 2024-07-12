import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner } from '@coreui/react';
import './scss/style.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));

const App = () => {
  const storedTheme = useSelector((state) => state.theme);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to indicate loading state

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token); // Update isAuthenticated based on the presence of token
    };

    checkAuthentication(); // Check authentication status on component mount

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on component mount

  useEffect(() => {
    // Apply the stored theme when it changes
    if (storedTheme) {
      document.body.className = ''; // Reset any existing theme classes
      document.body.classList.add(storedTheme);
    }
  }, [storedTheme]);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message; // Return the error message
      }

      localStorage.setItem('authToken', data.token); // Store token in localStorage
      setIsAuthenticated(true); // Update isAuthenticated state
      return null; // No error message
    } catch (error) {
      console.error('Login error:', error);
      return 'Server error'; // Return a generic error message
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove token from localStorage
    setIsAuthenticated(false); // Update isAuthenticated state
    window.location.reload(); // Refresh the page
  };

  if (isAuthenticated === null) {
    // Handle initial loading state, maybe show a spinner or loading indicator
    return (
      <div className="loading-container">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="loading-container">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="*" element={<DefaultLayout onLogout={handleLogout} />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login handleLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
