import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./storeOwner.css";

export default function StoreDashboard() {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const token = localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/store-owner/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStore(res.data.store);
      setRatings(res.data.ratings);
      setAvgRating(parseFloat(res.data.avgRating));
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="store-dashboard-full">
      <header>
        <h1>Welcome, {store?.name}</h1>
      </header>

      {store && (
        <div className="store-info">
          <p><b>Email:</b> {store.email}</p>
          <p><b>Address:</b> {store.address}</p>
          <p><b>Average Rating:</b> {avgRating.toFixed(2)}</p>
        </div>
      )}

      <h2>User Ratings</h2>
      {ratings.length > 0 ? (
        <table className="ratings-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r) => (
              <tr key={r.user_id}>
                <td>{r.user_name}</td>
                <td>{r.user_email}</td>
                <td>⭐ {r.rating}</td>
                <td>{new Date(r.rated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No ratings yet</p>
      )}
    </div>
  );
}
