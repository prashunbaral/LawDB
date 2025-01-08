import React, { useState } from 'react';
import { Search, UserCog, Scale, Menu } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';


interface LawResult {
  title: string;
  description: string;
  category: string;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
}

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LawResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    { id: '1', title: 'New Law Enforced', description: 'Details about a new law enforcement.' },
    { id: '2', title: 'Update on Civil Law', description: 'Civil law updated this week.' },
    { id: '3', title: 'Constitutional Law Changes', description: 'Constitutional law changes announced.' },
  ]);

  const filters = [
    { id: 'all', label: 'All Laws' },
    { id: 'civil', label: 'Civil Laws' },
    { id: 'criminal', label: 'Criminal Laws' },
    { id: 'constitutional', label: 'Constitutional' },
    { id: 'commercial', label: 'Commercial' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/laws', {
        params: { category: searchQuery },
      });

      console.log('API Response:', response.data); // Add this line to log the response

      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNews = (id: string) => {
    setNewsItems(newsItems.filter(news => news.id !== id));
  };

  const handleEditNews = (id: string, updatedTitle: string, updatedDescription: string) => {
    setNewsItems(newsItems.map(news =>
      news.id === id
        ? { ...news, title: updatedTitle, description: updatedDescription }
        : news
    ));
  };

  const filteredResults = activeFilter === 'all'
    ? searchResults
    : searchResults.filter(result => result.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={32} className="text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Nepal Legal Search</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <UserCog size={20} />
                Admin
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors text-left ${
                      activeFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  <UserCog size={20} />
                  Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* News Section */}
      <div className="bg-gray-100 py-4">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee space-x-8">
            {newsItems.map(news => (
              <div key={news.id} className="bg-white p-4 rounded-lg shadow-sm flex-none min-w-[300px] mr-6">
                <h3 className="font-semibold text-lg">{news.title}</h3>
                <p className="text-sm">{news.description}</p>
                <div className="flex mt-2 space-x-4">
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <div className="mb-6 md:mb-8">
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200&h=400"
              alt="Nepal Supreme Court"
              className="w-full h-[200px] md:h-[400px] object-cover rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
            Nepal Law Search
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Search and explore Nepalese laws and regulations with ease
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter keywords to search laws..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search size={20} />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {filteredResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {filteredResults.map((result, index) => (
              <div
                key={index}
                className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {result.title}
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  {result.description}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {result.category}
                </span>
              </div>
            ))}
          </div>
        )}

        {filteredResults.length === 0 && searchQuery && !isLoading && (
          <div className="text-center text-gray-600 mt-8">
            No results found for your search. Try different keywords.
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
