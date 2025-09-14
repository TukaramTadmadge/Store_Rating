import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (!user) return null; // hide navbar if not logged in

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) return alert("Enter new password");

    try {
      await axios.post(
        "http://localhost:5000/user/auth/update-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Password updated successfully!");
      setNewPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">Store Ratings</Link>
        </div>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>

          {/* Normal User Links */}
          {user.role_id === 2 && <>
            <li><Link to="/stores">Stores</Link></li>
          </>}

          {/* Store Owner Links */}
          {user.role_id === 3 && <>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </>}

          {/* Admin Links */}
          {user.role_id === 1 && <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
          </>}

          {/* Change Password Button for Normal User & Store Owner */}
          {(user.role_id === 2 || user.role_id === 3) && (
            <li>
              <button className="btn-logout" onClick={() => setShowPasswordModal(true)}>
                Update Password
              </button>
            </li>
          )}

          <li>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="password-modal">
          <div className="modal-content">
            <h3>Update Password</h3>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handlePasswordUpdate}>Update</button>
              <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
