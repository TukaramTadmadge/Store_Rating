import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [selectedRatings, setSelectedRatings] = useState({});
  const [editingStore, setEditingStore] = useState(null);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/stores/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);

      const ratingsMap = {};
      res.data.forEach(store => ratingsMap[store.id] = store.userRating || null);
      setSelectedRatings(ratingsMap);
    } catch {
      alert("Failed to fetch stores");
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/user/stores/search",
        { name: searchName, address: searchAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores(res.data);
    } catch {
      alert("Search failed");
    }
  };

  const handleSaveRating = async (storeId) => {
    const rating = selectedRatings[storeId];
    if (!rating) return alert("Select a rating first");

    try {
      await axios.post(
        "http://localhost:5000/user/stores/rate",
        { store_id: storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating saved!");
      setEditingStore(null);
      fetchStores();
    } catch {
      alert("Failed to save rating");
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleModifyClick = (storeId) => setEditingStore(storeId);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name} 👋</h1>

      <div className="search-container">
        <input placeholder="Name" value={searchName} onChange={e => setSearchName(e.target.value)} />
        <input placeholder="Address" value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
        <button onClick={fetchStores}>Reset</button>
      </div>

      <div className="store-list">
        {stores.map(store => {
          const userHasRated = !!store.userRating;
          const isEditing = editingStore === store.id;

          return (
            <div key={store.id} className="store-card">
              <h3>{store.name}</h3>
              <p>{store.address}</p>
              <p>⭐ Overall Rating: {parseFloat(store.overallRating).toFixed(1)}</p>
              <p>📝 Your Rating: {store.userRating || "Not rated yet"}</p>

              <div className="rating-buttons">
                {[1,2,3,4,5].map(r => (
                  <button
                    key={r}
                    className={selectedRatings[store.id] === r ? "selected" : ""}
                    onClick={() => setSelectedRatings({ ...selectedRatings, [store.id]: r })}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="action-buttons">
                {!userHasRated && <button onClick={() => handleSaveRating(store.id)}>Save</button>}
                {userHasRated && !isEditing && <button onClick={() => handleModifyClick(store.id)}>Modify</button>}
                {userHasRated && isEditing && <button onClick={() => handleSaveRating(store.id)}>Save</button>}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
