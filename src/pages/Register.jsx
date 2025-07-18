import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const backendURL = "https://servermedi.onrender.com";

    try {
      const res = await axios.post(`${backendURL}/api/auth/register`, formData);
      if (res.status === 201 || res.status === 200) {
        setMessage('Registration successful! You can now log in.');
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        {message && (
          <div className="text-sm text-center text-red-500">{message}</div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 cursor-pointer text-xl"
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? '👁️' : '🙈'}
          </span>
        </div>

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
        >
          Register
        </button>

        <p className="text-sm text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-blue-500 hover:underline"
          >
            Login here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
