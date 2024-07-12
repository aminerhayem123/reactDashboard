import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'; // Change to BrowserRouter
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import Packs from './views/pages/packs/packs';
import Items from './views/pages/items/items';
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard')); 

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);

    // Check if user is authenticated (example: check localStorage for token)
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      localStorage.setItem('authToken', data.token);
      setIsAuthenticated(true);
      return null; // No error message
    } catch (error) {
      console.error('Login error:', error);
      return 'Server error'; // Return a generic error message
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    // Handle initial loading state, maybe show a spinner or loading indicator
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter> {/* Change to BrowserRouter */}
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/" element={<Navigate to="/login" />} />
          <Route
            exact
            path="/login"
            name="Login Page"
            element={<Login handleLogin={handleLogin} />}
          />
          <Route
            path="*"
            name="Home"
            element={
              isAuthenticated ? (
                <DefaultLayout onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
