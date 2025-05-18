import React, { useState, useEffect } from 'react';
import { Search, UserCog, Scale, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';
import LawDetails from './components/LawDetails';
import Chatbot from './components/Chatbot';

import ConstitutionalLaw from './components/constitutionalLaw';
import RecentAin from './components/RecentAin';
import AinBySection from './components/AinBySection';
import AinOutsideSection from './components/AinOutsideSection';
import AinByClassification from './components/AinByClassification';
import Chairman from './components/Chairman';
import Rulebook from './components/Rulebook';
import FormationOrders from './components/FormationOrders';

interface LawResult {
  _id: string;
  title: string;
  description: string;
  category: string;
  law_id: number;
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
  const [displayCount, setDisplayCount] = useState(6);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    { id: '1', title: 'New Law Enforced', description: 'Details about a new law enforcement.' },
    { id: '2', title: 'Update on Civil Law', description: 'Civil law updated this week.' },
    { id: '3', title: 'Constitutional Law Changes', description: 'Constitutional law changes announced.' },
  ]);
  const navigate = useNavigate();

  const filters = [
    { id: 'all', label: 'All Laws' },
    { id: 'civil', label: 'Civil Laws' },
    { id: 'criminal', label: 'Criminal Laws' },
    { id: 'constitutional', label: 'Constitutional' },
    { id: 'commercial', label: 'Commercial' }
  ];

  // Dropdown open states for "मौजूदा कानून"
  const [openMaujudaDropdown, setOpenMaujudaDropdown] = useState(false);
  const [openAinSubmenu, setOpenAinSubmenu] = useState(false);

  // Fetch all laws when component mounts
  useEffect(() => {
    fetchAllLaws();
  }, []);

  const fetchAllLaws = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/laws');
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to fetch laws:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/laws', {
        params: { 
          query: searchQuery.trim(),
          category: activeFilter !== 'all' ? activeFilter : ''
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        fetchAllLaws();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterChange = async (filterId: string) => {
    setActiveFilter(filterId);
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/laws', {
        params: { 
          category: filterId !== 'all' ? filterId : '',
          query: searchQuery
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  const displayedResults = searchResults.slice(0, displayCount);
  const hasMoreResults = searchResults.length > displayCount;

  const handleLawClick = (law: LawResult) => {
    if (law.law_id) {
      navigate(`/law/${law.law_id}`);
    }
  };

  // Toggle dropdown handlers for "मौजूदा कानून"
  const toggleMaujudaDropdown = () => {
    setOpenMaujudaDropdown(prev => !prev);
    if (openMaujudaDropdown) setOpenAinSubmenu(false);
  };
  const toggleAinSubmenu = () => setOpenAinSubmenu(prev => !prev);

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
            <div className="hidden md:flex space-x-4 items-center relative">

             
              {/* Original filters */}
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
               {/* मौजूदा कानून dropdown */}
<div className="relative">
  <button
    onClick={toggleMaujudaDropdown}
    className={`flex items-center gap-1 px-4 py-2 font-semibold rounded-md hover:text-blue-600 focus:outline-none ${
      openMaujudaDropdown ? 'text-blue-600' : 'text-gray-700'
    }`}
  >
    मौजूदा कानून
    <ChevronDown size={16} />
  </button>

  {openMaujudaDropdown && (
    <ul className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-md shadow-lg z-50">
      <li>
        <Link
          to="/laws/constitutional"
          onClick={() => setOpenMaujudaDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          संविधान
        </Link>
      </li>
      <li className="relative group">
        <button
          onClick={toggleAinSubmenu}
          className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          ऐन
          {openAinSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openAinSubmenu && (
          <ul className="absolute top-0 left-full mt-0 ml-1 w-56 bg-white border rounded-md shadow-lg z-50">
            <li>
              <Link
                to="/laws/ain/recent"
                onClick={() => setOpenMaujudaDropdown(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                हालसालैका ऐन
              </Link>
            </li>
            <li>
              <Link
                to="/laws/ain/by-section"
                onClick={() => setOpenMaujudaDropdown(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                खण्ड अनुसार
              </Link>
            </li>
            <li>
              <Link
                to="/laws/ain/outside-section"
                onClick={() => setOpenMaujudaDropdown(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                खण्ड बाहेकका ऐन
              </Link>
            </li>
            <li>
              <Link
                to="/laws/ain/by-classification"
                onClick={() => setOpenMaujudaDropdown(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                वर्गीकरण अनुसारको सूची
              </Link>
            </li>
          </ul>
        )}
      </li>
      <li>
        <Link
          to="/laws/chairman"
          onClick={() => setOpenMaujudaDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          अध्यक्ष
        </Link>
      </li>
      <li>
        <Link
          to="/laws/rulebook"
          onClick={() => setOpenMaujudaDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          नियमावली
        </Link>
      </li>
      <li>
        <Link
          to="/laws/formation-orders"
          onClick={() => setOpenMaujudaDropdown(false)}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          (गठन) आदेश
        </Link>
      </li>
    </ul>
  )}
</div>


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
                <ul className="pl-4 border-l border-gray-300 mt-2 space-y-1">
  <li>
    <Link
      to="/laws/constitutional"
      onClick={() => {
        setIsMenuOpen(false);
        setOpenMaujudaDropdown(false);
      }}
      className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
    >
      संविधान
    </Link>
  </li>
  <li>
    <button
      onClick={toggleAinSubmenu}
      className="w-full flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
    >
      ऐन
      {openAinSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {openAinSubmenu && (
      <ul className="pl-4 border-l border-gray-300 mt-1 space-y-1">
        <li>
          <Link
            to="/laws/ain/recent"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMaujudaDropdown(false);
              setOpenAinSubmenu(false);
            }}
            className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
          >
            हालसालैका ऐन
          </Link>
        </li>
        <li>
          <Link
            to="/laws/ain/by-section"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMaujudaDropdown(false);
              setOpenAinSubmenu(false);
            }}
            className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
          >
            खण्ड अनुसार
          </Link>
        </li>
        <li>
          <Link
            to="/laws/ain/outside-section"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMaujudaDropdown(false);
              setOpenAinSubmenu(false);
            }}
            className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
          >
            खण्ड बाहेकका ऐन
          </Link>
        </li>
        <li>
          <Link
            to="/laws/ain/by-classification"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMaujudaDropdown(false);
              setOpenAinSubmenu(false);
            }}
            className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
          >
            वर्गीकरण अनुसारको सूची
          </Link>
        </li>
      </ul>
    )}
  </li>
  <li>
    <Link
      to="/laws/chairman"
      onClick={() => {
        setIsMenuOpen(false);
        setOpenMaujudaDropdown(false);
      }}
      className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
    >
      अध्यक्ष
    </Link>
  </li>
  <li>
    <Link
      to="/laws/rulebook"
      onClick={() => {
        setIsMenuOpen(false);
        setOpenMaujudaDropdown(false);
      }}
      className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
    >
      नियमावली
    </Link>
  </li>
  <li>
    <Link
      to="/laws/formation-orders"
      onClick={() => {
        setIsMenuOpen(false);
        setOpenMaujudaDropdown(false);
      }}
      className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer block"
    >
      (गठन) आदेश
    </Link>
  </li>
</ul>


                {/* Original filters */}
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      handleFilterChange(filter.id);
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
            placeholder="Search by title or description..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600 mt-8">
            Searching...
          </div>
        ) : displayedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {displayedResults.map((result) => (
                <div
                  key={result._id}
                  onClick={() => handleLawClick(result)}
                  className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                    {result.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    {result.description}
                  </p>
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {result.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMoreResults && (
              <div className="text-center mt-8">
                <button
                  onClick={handleViewMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  View More Laws
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-600 mt-8">
            {searchQuery.trim() 
              ? 'No laws found matching your search. Try different keywords.'
              : 'No laws available. Please add some laws through the admin panel.'}
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
        <Route path="/law/:lawId" element={<LawDetails />} />


        <Route path="/laws/constitutional" element={<ConstitutionalLaw />} />
        <Route path="/laws/ain/recent" element={<RecentAin />} />
        <Route path="/laws/ain/by-section" element={<AinBySection />} />
        <Route path="/laws/ain/outside-section" element={<AinOutsideSection />} />
        <Route path="/laws/ain/by-classification" element={<AinByClassification />} />
        <Route path="/laws/chairman" element={<Chairman />} />
        <Route path="/laws/rulebook" element={<Rulebook />} />
        <Route path="/laws/formation-orders" element={<FormationOrders />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
