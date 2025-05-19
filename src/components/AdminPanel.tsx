import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Law {
  id: string;
  title: string;
  description: string;
  category: string;
  type?: {
    mainType: string;
    subType: string | null;
  };
  law_id: number;
  createdAt: string;
}

interface ApiError {
  message: string;
  details?: string;
  error?: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [laws, setLaws] = useState<Law[]>([]);
  const [editingLaw, setEditingLaw] = useState<Law | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [newLaw, setNewLaw] = useState<Law>({
    id: '',
    title: '',
    description: '',
    category: 'civil',
    type: {
      mainType: 'मौजूदा कानून',
      subType: null
    },
    law_id: 0,
    createdAt: new Date().toISOString()
  });
  const [showEditOverlay, setShowEditOverlay] = useState(false);

  // Fetch laws from the backend with error handling
  const fetchLaws = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/laws');
      setLaws(response.data);
    } catch (error) {
      console.error('Failed to fetch laws:', error);
      setError('Failed to load laws. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLaws();
    }
  }, [isLoggedIn, fetchLaws]);

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
  
    console.log('Adding new law:', newLaw);
  
    try {
      const response = await axios.post('http://localhost:5000/api/laws', newLaw);
      setLaws([...laws, response.data]);
      setNewLaw({ 
        id: '', 
        title: '', 
        description: '', 
        category: 'civil', 
        type: {
          mainType: 'मौजूदा कानून',
          subType: null
        },
        law_id: 0, 
        createdAt: new Date().toISOString() 
      }); // Reset form
    } catch (error) {
      console.error('Failed to add law:', error);
    }
  };
  

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this law?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting to delete law with ID:', id);
      
      // First verify the law exists in our state
      const lawToDelete = laws.find(law => law.law_id === id);
      if (!lawToDelete) {
        setError('Law not found in the current list');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/laws/${id}`);
      console.log('Delete response:', response.data);

      if (response.data?.message === 'Law deleted successfully') {
        // Optimistically update the UI
        setLaws(prevLaws => prevLaws.filter(law => law.law_id !== id));
        console.log('Law successfully removed from state');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Failed to delete law:', error);
      let errorMessage = 'Failed to delete law';
      
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        errorMessage = apiError?.details || apiError?.message || errorMessage;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (law: Law) => {
    setEditingLaw(law);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaw) return;
    console.log(editingLaw);

    try {
      // Basic validation
      if (!editingLaw.title || !editingLaw.description || !editingLaw.category) {
        alert('Please fill in all fields');
        return;
      }

      const updateData = {
        title: editingLaw.title,
        description: editingLaw.description,
        category: editingLaw.category
      };

      const response = await axios.put(
        `http://localhost:5000/api/laws/${editingLaw.law_id}`,
        updateData
      );

      if (response.data) {
        // Update the laws list with the updated law
        setLaws(prevLaws => 
          prevLaws.map(law => 
            law.law_id === editingLaw.law_id ? response.data : law
          )
        );
        // Close the edit overlay
        setEditingLaw(null);
        setShowEditOverlay(false);
      }
    } catch (error) {
      console.error('Failed to update law:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to update law';
        alert(errorMessage);
      }
    }
  };

  // Add this function after fetchLaws
  const filterLaws = (laws: Law[]) => {
    let filtered = [...laws];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(law => law.category === categoryFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      filtered = filtered.filter(law => {
        const lawDate = new Date(law.createdAt);
        switch (dateFilter) {
          case 'today':
            return lawDate >= today;
          case 'yesterday':
            return lawDate >= yesterday && lawDate < today;
          case 'lastWeek':
            return lawDate >= lastWeek;
          case 'lastMonth':
            return lawDate >= lastMonth;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  // Add this function to handle type changes
  const handleTypeChange = (mainType: string, subType: string | null = null) => {
    setNewLaw(prev => ({
      ...prev,
      type: {
        mainType,
        subType: mainType === 'ऐन' ? subType : null
      }
    }));
  };

  // Add this function to safely get type display
  const getTypeDisplay = (law: Law) => {
    if (!law.type) return 'मौजूदा कानून'; // Default type for existing laws
    return law.type.mainType + (law.type.subType ? ` - ${law.type.subType}` : '');
  };

  // Add migration function
  const handleMigrateTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting migration...');
      
      const response = await axios.post('http://localhost:5000/api/migrate-types', {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Migration response:', response.data);
      
      if (response.data.errorCount > 0) {
        alert(`Migration completed with some errors. Updated ${response.data.updatedCount} laws, ${response.data.errorCount} errors, ${response.data.skippedCount} skipped.`);
      } else {
        alert(`Migration completed successfully. Updated ${response.data.updatedCount} laws, ${response.data.skippedCount} skipped.`);
      }
      
      // Refresh the laws list after migration
      await fetchLaws();
    } catch (error: any) {
      console.error('Migration error:', error);
      let errorMessage = 'Migration failed';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.data?.error || error.message;
        setError(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check if the server is running.';
        setError(errorMessage);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
        setError(errorMessage);
      }
      
      alert(`Migration failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add reset database handler
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will delete all existing laws and add sample data.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting database reset...');
      
      const response = await axios.post('http://localhost:5000/api/reset-database');
      console.log('Reset response:', response.data);
      
      alert(`Database reset successful. Added ${response.data.sampleLawsAdded} sample laws.`);
      
      // Refresh the laws list
      await fetchLaws();
    } catch (error: any) {
      console.error('Reset error:', error);
      let errorMessage = 'Database reset failed';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || error.message;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(`Database reset failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDatabase}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Reset Database
            </button>
            <button
              onClick={handleMigrateTypes}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Migrate Types
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            Loading...
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="civil">Civil Laws</option>
                <option value="criminal">Criminal Laws</option>
                <option value="constitutional">Constitutional</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Created</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="lastWeek">Last 7 Days</option>
                <option value="lastMonth">Last 30 Days</option>
              </select>
            </div>
          </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="space-y-2">
                <select
                  value={newLaw.type?.mainType || ''}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="मौजूदा कानून">मौजूदा कानून</option>
                  <option value="संविधान">संविधान</option>
                  <option value="ऐन">ऐन</option>
                  <option value="अध्यक्ष">अध्यक्ष</option>
                  <option value="नियमावली">नियमावली</option>
                  <option value="(गठन) आदेश">(गठन) आदेश</option>
                </select>

                {newLaw.type?.mainType === 'ऐन' && (
                  <select
                    value={newLaw.type?.subType || ''}
                    onChange={(e) => handleTypeChange('ऐन', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Subtype</option>
                    <option value="हालसालैका ऐन">हालसालैका ऐन</option>
                    <option value="खण्ड अनुसार">खण्ड अनुसार</option>
                    <option value="खण्ड बाहेकका ऐन">खण्ड बाहेकका ऐन</option>
                    <option value="वर्गीकरण अनुसारको सूची">वर्गीकरण अनुसारको सूची</option>
                  </select>
                )}
              </div>
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
            {filterLaws(laws).map((law, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{law.title}</h3>
                    <p className="text-gray-600 mt-1">{law.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {law.category}
                      </span>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {getTypeDisplay(law)}
                      </span>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {new Date(law.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(law)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(law.law_id)}
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
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingLaw(null);
              }
            }}
          >
            <div className="bg-white rounded-lg p-6 w-96 relative">
              <button
                onClick={() => setEditingLaw(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
