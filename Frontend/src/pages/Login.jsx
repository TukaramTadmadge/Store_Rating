import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UserContext from '../context/UserContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill all fields');

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const user = res.data.user;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      switch (user.role_id) {
        case 1: navigate('/admin/dashboard'); break;
        case 2: navigate('/stores'); break;
        case 3: navigate('/dashboard'); break;
        default: navigate('/'); break;
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <div className="error-msg">{error}</div>}

        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
        </label>

        <label>Password
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="auth-foot">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </form>
    </div>
  );
}
