import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

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
  const BASE_URL = 'https://healsync-qjdq.onrender.com';

  useEffect(() => {
    const fetchReminders = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/medicine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReminders(res.data);
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
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
    if (!token) return setMessage('❌ No token found');

    try {
      const res = await axios.post(`${BASE_URL}/api/medicine`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders([...reminders, res.data]);
      setMessage('✅ Reminder added!');
      setFormData({ name: '', dosage: '', time: '', date: '', duration: '', notes: '' });
    } catch (err) {
      console.error('Add error:', err);
      setMessage(err.response?.data?.msg || '❌ Error adding reminder');
    }
  };

  const startEdit = (reminder) => {
    setEditId(reminder._id);
    setEditData({
      name: reminder.name,
      dosage: reminder.dosage,
      time: reminder.time,
      date: reminder.date.slice(0, 10),
      duration: reminder.duration,
      notes: reminder.notes || '',
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/medicine/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      cancelEdit();
      setMessage('✅ Reminder updated!');
    } catch (err) {
      console.error('Edit error:', err);
      setMessage(err.response?.data?.msg || '❌ Error updating');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/medicine/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(reminders.filter((r) => r._id !== id));
      setMessage('✅ Deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('❌ Error deleting reminder');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-800">💊 Medicine Dashboard</h2>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* FORM SECTION */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg p-6 rounded-xl grid gap-4 max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-center text-green-700 mb-2">➕ Add Medicine Reminder</h3>
          {['name', 'dosage', 'time', 'date', 'duration', 'notes'].map((field) => (
            <input
              key={field}
              name={field}
              type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required={field !== 'notes'}
            />
          ))}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            ➕ Add Reminder
          </button>
        </form>

        {/* Success/Error Message */}
        {message && (
          <p className="text-center mt-4 text-sm font-medium text-green-700">{message}</p>
        )}

        {/* REMINDER LIST */}
        <h3 className="text-2xl font-semibold mt-10 mb-4 text-green-700">📋 Your Reminders</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {reminders.length === 0 ? (
            <p className="text-gray-600">No reminders yet.</p>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder._id}
                className="bg-green-50 border border-green-200 p-4 rounded-xl shadow transition-transform duration-300 hover:shadow-xl hover:scale-[1.01] min-h-[180px]"
              >
                {editId === reminder._id ? (
                  <div className="grid gap-2">
                    {['name', 'dosage', 'time', 'date', 'duration', 'notes'].map((field) => (
                      <input
                        key={field}
                        name={field}
                        type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
                        value={editData[field]}
                        onChange={handleEditChange}
                        className="p-2 border rounded-md"
                        required={field !== 'notes'}
                      />
                    ))}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => saveEdit(reminder._id)}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        <FaSave /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-md font-bold text-green-800 mb-1">{reminder.name}</h4>
                    <p className="text-sm text-gray-700">💊 Dosage: {reminder.dosage}</p>
                   
                    <p className="text-sm text-gray-700">🕒 Time: {reminder.time}</p>
                    <p className="text-sm text-gray-700">⏳ Duration: {reminder.duration} days</p>
                    {reminder.notes && (
                      <p className="italic text-sm text-gray-600 mt-1">📝 {reminder.notes}</p>
                    )}
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => startEdit(reminder)}
                        className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
