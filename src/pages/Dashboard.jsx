import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    time: '',
    date: '',
    duration: '',     // <-- Added here
    notes: '',
  });

  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReminders = async () => {
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/medicine', {
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
      const res = await axios.post('http://localhost:5000/api/medicine', formData, {
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
      duration: reminder.duration || '',      // <-- Added here
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
      const res = await axios.put(
        `http://localhost:5000/api/medicine/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      await axios.delete(`http://localhost:5000/api/medicine/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setMessage('✅ Reminder deleted!');
    } catch (err) {
      console.error('Error deleting reminder:', err.response || err);
      setMessage(`❌ ${err.response?.data?.msg || 'Failed to delete reminder'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Logout Button */}
      <div className="w-full max-w-3xl flex justify-end mb-6">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            onLogout();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        >
          Logout
        </button>
      </div>

      {/* Reminder Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full mb-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Add Medicine Reminder
        </h2>

        {message && (
          <p
            className={`mb-4 text-center font-semibold ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            type="text"
            name="dosage"
            placeholder="Dosage (e.g., 500mg)"
            value={formData.dosage}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Duration input added here */}
          <input
            type="number"
            name="duration"
            placeholder="Number of days to remind"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
            className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <textarea
          name="notes"
          placeholder="Additional Notes (optional)"
          value={formData.notes}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-3 mt-6 w-full focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
          rows={3}
        />

        <button
          type="submit"
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md shadow"
        >
          Save Reminder
        </button>
      </form>

      {/* Reminders List */}
      <div className="max-w-3xl w-full">
        <h3 className="text-2xl font-semibold mb-6 text-indigo-700">
          Your Medicine Reminders
        </h3>

        {reminders.length === 0 ? (
          <p className="text-gray-600 italic">No reminders found. Add one above!</p>
        ) : (
          <ul className="space-y-4">
            {reminders.map((reminder) =>
              editId === reminder._id ? (
                <li
                  key={reminder._id}
                  className="bg-white rounded-lg shadow p-5 flex flex-col gap-4"
                >
                  {/* Editable fields */}
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <input
                    type="text"
                    name="dosage"
                    value={editData.dosage}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <input
                    type="time"
                    name="time"
                    value={editData.time}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <input
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  {/* Duration input added here */}
                  <input
                    type="number"
                    name="duration"
                    value={editData.duration}
                    onChange={handleEditChange}
                    min="1"
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <textarea
                    name="notes"
                    value={editData.notes}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                    rows={3}
                  />

                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => saveEdit(reminder._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={reminder._id}
                  className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:justify-between md:items-center"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {reminder.name}
                    </h4>
                    <p className="text-gray-600">
                      Dosage: <span className="font-medium">{reminder.dosage}</span>
                    </p>
                    <p className="text-gray-600">
                      Time: <span className="font-medium">{reminder.time}</span>
                    </p>
                    <p className="text-gray-600">
                      Date:{' '}
                      <span className="font-medium">
                        {new Date(reminder.date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Duration:{' '}
                      <span className="font-medium">{reminder.duration} days</span>
                    </p>
                    {reminder.notes && (
                      <p className="text-gray-600 italic mt-1">Notes: {reminder.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button
                      onClick={() => startEdit(reminder)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
