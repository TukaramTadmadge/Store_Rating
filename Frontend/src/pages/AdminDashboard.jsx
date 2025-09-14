import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_stores: 0, total_ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [activeTab, setActiveTab] = useState("users");

  const [newUser, setNewUser] = useState({ name: "", email: "", address: "", role_id: "", password: "" });
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", password: "" });

  useEffect(() => {
    axios.get("http://localhost:5000/admin/dashboard").then(res => setStats(res.data));
    axios.get("http://localhost:5000/admin/roles").then(res => setRoles(res.data));
  }, []);

  const fetchUsers = () =>
    axios.get("http://localhost:5000/admin/users", { params: filters }).then(res => {
      setUsers(res.data);
      setActiveTab("users");
    });

  const fetchStores = () =>
    axios.get("http://localhost:5000/admin/stores", { params: filters }).then(res => {
      setStores(res.data);
      setActiveTab("stores");
    });

  const validate = ({ name, email, address, password }) => {
    if (name && (name.length < 20 || name.length > 60)) return "Name must be 20–60 characters.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email.";
    if (address && address.length > 400) return "Address must not exceed 400 characters.";
    if (password && !/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password))
      return "Password must be 8–16 chars, include 1 uppercase & 1 special char.";
    return null;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const data = type === "user" ? newUser : newStore;
    const error = validate(data);
    if (error) return alert(error);

    try {
      await axios.post(`http://localhost:5000/admin/${type === "user" ? "users" : "stores"}`, data);
      alert(`${type} added successfully`);
      type === "user" ? fetchUsers() : fetchStores();
      type === "user"
        ? setNewUser({ name: "", email: "", address: "", role_id: "", password: "" })
        : setNewStore({ name: "", email: "", address: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.error || `Failed to add ${type}`);
    }
  };

  const renderInputs = (fields, state, setState) =>
    fields.map(({ label, key, type = "text" }) => (
      <input
        key={key}
        type={type}
        placeholder={label}
        value={state[key]}
        onChange={(e) => setState({ ...state, [key]: e.target.value })}
        required
      />
    ));

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Actions</h2>
        <button onClick={() => document.getElementById("userForm").classList.toggle("hidden")}>Add User</button>
        <button onClick={() => document.getElementById("storeForm").classList.toggle("hidden")}>Add Store</button>
        <button onClick={fetchUsers}>Show Users</button>
        <button onClick={fetchStores}>Show Stores</button>

        {/* User Form */}
        <form id="userForm" className="hidden" onSubmit={(e) => handleSubmit(e, "user")}>
          <h3>Add User</h3>
          {renderInputs(
            [
              { label: "Name", key: "name" },
              { label: "Email", key: "email", type: "email" },
              { label: "Address", key: "address" },
              { label: "Password", key: "password", type: "password" },
            ],
            newUser,
            setNewUser
          )}
          <select
            value={newUser.role_id}
            onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
            required
          >
            <option value="">Select Role</option>
            {roles.filter((r) => r.name.toLowerCase() !== "store owner").map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="submit">Save User</button>
        </form>

        {/* Store Form */}
        <form id="storeForm" className="hidden" onSubmit={(e) => handleSubmit(e, "store")}>
          <h3>Add Store</h3>
          {renderInputs(
            [
              { label: "Store Name", key: "name" },
              { label: "Store Email", key: "email", type: "email" },
              { label: "Store Address", key: "address" },
              { label: "Password", key: "password", type: "password" },
            ],
            newStore,
            setNewStore
          )}
          <button type="submit">Save Store</button>
        </form>
      </div>

      {/* Main */}
      <div className="main-content">
        <h1>Admin Dashboard</h1>
        <div className="stats">
          <p>Total Users: {stats.total_users}</p>
          <p>Total Stores: {stats.total_stores}</p>
          <p>Total Ratings: {stats.total_ratings}</p>
        </div>

        {/* Filters */}
        <div className="filters">
          {Object.keys(filters).map((key) => (
            <input
              key={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={filters[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            />
          ))}
          <button onClick={() => (activeTab === "users" ? fetchUsers() : fetchStores())}>Filter</button>
        </div>

        {/* Tables */}
        {activeTab === "users" && (
          <Table title="Users" data={users} cols={["id", "name", "email", "address", "role"]} />
        )}
        {activeTab === "stores" && (
          <Table title="Stores" data={stores} cols={["id", "name", "email", "address", "rating"]} />
        )}
      </div>
    </div>
  );
}

function Table({ title, data, cols }) {
  return (
    <>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c.toUpperCase()}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {cols.map((c) => (
                <td key={c}>{row[c] || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
