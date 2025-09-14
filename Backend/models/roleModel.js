import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // { id, name, email, role }

  // Fetch all stores
  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stores/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Search stores
  const handleSearch = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stores/search", {
        params: { name: searchName, address: searchAddress },
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit or update rating
  const handleRating = async (storeId, rating) => {
    try {
      await axios.post(
        "http://localhost:5000/api/stores/rate",
        { userId: user.id, storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStores();
    } catch (err) {
      console.error(err);
    }
  };

  // Update password
  const handlePasswordUpdate = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/update-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      alert("Error updating password");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name} 👋</h1>

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={fetchStores}>Reset</button>
      </div>

      {/* Store List */}
      <div className="store-list">
        {stores.map((store) => (
          <div key={store.id} className="store-card">
            <h3>{store.name}</h3>
            <p>{store.address}</p>
            <p>
              ⭐ Overall Rating: {parseFloat(store.overallRating).toFixed(1)}
            </p>
            <p>📝 Your Rating: {store.userRating || "Not rated yet"}</p>

            {/* Rating Buttons */}
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => handleRating(store.id, r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Password Update */}
      <div className="password-update">
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handlePasswordUpdate}>Update</button>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
