import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Law {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [laws, setLaws] = useState<Law[]>([]);
  const [editingLaw, setEditingLaw] = useState<Law | null>(null);
  const [newLaw, setNewLaw] = useState<Law>({
    id: '',
    title: '',
    description: '',
    category: 'civil'
  });

  // Fetch laws from the backend
  const fetchLaws = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/laws');
      setLaws(response.data);
    } catch (error) {
      console.error('Failed to fetch laws:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLaws();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement authentication logic (e.g., API call for login)
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
    }
  };

  const handleAddLaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaw.title || !newLaw.description) return;
  
    console.log('Adding new law:', newLaw);  // Log the request body
  
    try {
      const response = await axios.post('http://localhost:5000/api/laws', newLaw);
      setLaws([...laws, response.data]);
      setNewLaw({ id: '', title: '', description: '', category: 'civil' }); // Reset form
    } catch (error) {
      console.error('Failed to add law:', error);
    }
  };
  

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/laws/${id}`);
      setLaws(laws.filter(law => law.id !== id));
    } catch (error) {
      console.error('Failed to delete law:', error);
    }
  };

  const handleEdit = (law: Law) => {
    setEditingLaw(law);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaw) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/laws/${editingLaw.id}`, editingLaw);
      setLaws(laws.map(law => (law.id === editingLaw.id ? response.data : law)));
      setEditingLaw(null); // Close the edit form
    } catch (error) {
      console.error('Failed to update law:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            Back to Search
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Law</h2>
          <form onSubmit={handleAddLaw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newLaw.title}
                onChange={(e) => setNewLaw({ ...newLaw, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newLaw.description}
                onChange={(e) => setNewLaw({ ...newLaw, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newLaw.category}
                onChange={(e) => setNewLaw({ ...newLaw, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="civil">Civil Laws</option>
                <option value="criminal">Criminal Laws</option>
                <option value="constitutional">Constitutional</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Law
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Laws</h2>
          <div className="space-y-4">
            {laws.map(law => (
              <div key={law.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{law.title}</h3>
                    <p className="text-gray-600 mt-1">{law.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {law.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(law)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(law.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {editingLaw && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Law</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editingLaw.title}
                    onChange={(e) =>
                      setEditingLaw({ ...editingLaw, title: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editingLaw.description}
                    onChange={(e) =>
                      setEditingLaw({ ...editingLaw, description: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={editingLaw.category}
                    onChange={(e) =>
                      setEditingLaw({ ...editingLaw, category: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="civil">Civil Laws</option>
                    <option value="criminal">Criminal Laws</option>
                    <option value="constitutional">Constitutional</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Update Law
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
