import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/storeOwnerDashboard';        // Normal User
import StoreDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Admin
import Home from './pages/Home';                   // New Home Page

import UserContext, { UserProvider } from './context/UserContext';

function AppRoutes() {
  const { user, setUser } = useContext(UserContext);

  // Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, [setUser]);

  if (user === undefined) return <div className="loading">Loading...</div>;

  // Map role → default dashboard route
  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role_id) {
      case 1: return '/admin/dashboard'; // Admin
      case 2: return '/stores';          // Store Owner
      case 3: return '/dashboard';       // Normal User
      default: return '/';
    }
  };

  return (
    <>
      {user && <Navbar />}

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to={getDashboardRoute()} />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to={getDashboardRoute()} />}
        />

        
        <Route
          path="/stores"
          element={user?.role_id === 2 ? <StoreDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={user?.role_id === 3 ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/dashboard"
          element={user?.role_id === 1 ? <AdminDashboard /> : <Navigate to="/" />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}
