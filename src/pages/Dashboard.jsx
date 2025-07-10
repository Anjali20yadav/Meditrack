import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    time: '',
    date: '',
    duration: '',
    notes: '',
  });

  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchReminders = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/medicine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReminders(res.data);
      } catch (err) {
        console.error('Failed to fetch reminders:', err.response || err);
      }
    };

    fetchReminders();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setMessage('❌ No token found, please login again.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/medicine`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setMessage('✅ Medicine reminder added!');
        setFormData({ name: '', dosage: '', time: '', date: '', duration: '', notes: '' });
        setReminders((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Error adding medicine:', err.response || err);
      setMessage(`❌ ${err.response?.data?.msg || 'Failed to add reminder'}`);
    }
  };

  const startEdit = (reminder) => {
    setEditId(reminder._id);
    setEditData({
      name: reminder.name,
      dosage: reminder.dosage,
      time: reminder.time,
      date: reminder.date.slice(0, 10),
      duration: reminder.duration || '',
      notes: reminder.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/medicine/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReminders((prev) =>
        prev.map((r) => (r._id === id ? res.data : r))
      );
      setMessage('✅ Reminder updated!');
      cancelEdit();
    } catch (err) {
      console.error('Error updating reminder:', err.response || err);
      setMessage(`❌ ${err.response?.data?.msg || 'Failed to update reminder'}`);
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await axios.delete(`${BASE_URL}/api/medicine/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setMessage('✅ Reminder deleted!');
    } catch (err) {
      console.error('Error deleting reminder:', err.response || err);
      setMessage(`❌ ${err.response?.data?.msg || 'Failed to delete reminder'}`);
    }
  };

  // ... (your JSX part remains unchanged)
};

export default Dashboard;
