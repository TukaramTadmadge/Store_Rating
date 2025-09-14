import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'Normal User' // always fixed
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60)
      e.name = 'Name must be 20–60 characters.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Invalid email address.';
    if (!form.address || form.address.length > 400)
      e.address = 'Address is required and must be ≤ 400 characters.';
    if (!form.password.match(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/))
      e.password = 'Password must be 8–16 chars, include 1 uppercase & 1 special char.';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const eErrors = validate();
    if (Object.keys(eErrors).length) {
      setErrors(eErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', form);

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      navigate('/login');
    } catch (err) {
      setErrors({ submit: err?.response?.data?.error || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      <form className="signup-card" onSubmit={handleSubmit} noValidate>
        <h2>Create Account</h2>

        {errors.submit && <div className="err submit-err">{errors.submit}</div>}

        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name (20-60 chars)"
          />
          {errors.name && <small className="err">{errors.name}</small>}
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && <small className="err">{errors.email}</small>}
        </label>

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            rows="3"
          />
          {errors.address && <small className="err">{errors.address}</small>}
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="8–16 chars, 1 uppercase, 1 special"
          />
          {errors.password && <small className="err">{errors.password}</small>}
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <p>
          Already have an account?{" "}
          <span onClick={() => navigate('/login')} style={{color:'blue', cursor:'pointer'}}>Login</span>
        </p>
      </form>
    </div>
  );
}
