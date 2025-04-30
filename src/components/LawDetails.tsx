import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface LawDetails {
  _id: string;
  law_id: number;
  title: string;
  description: string;
  category: string;
}

export default function LawDetails() {
  const { lawId } = useParams<{ lawId: string }>();
  const [law, setLaw] = useState<LawDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLawDetails = async () => {
      try {
        console.log('Fetching law with ID:', lawId);
        const response = await axios.get(`http://localhost:5000/api/laws/${lawId}`);
        console.log('Received law data:', response.data);
        
        if (response.data) {
          setLaw(response.data);
        } else {
          setError('No law data received');
        }
      } catch (err: any) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load law details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (lawId) {
      fetchLawDetails();
    } else {
      setError('No law ID provided');
      setIsLoading(false);
    }
  }, [lawId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading law details...</div>
      </div>
    );
  }

  if (error || !law) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">
          {error || 'Law not found'}
          <div className="mt-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Return to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Search
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
              {law.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {law.title}
            </h1>
            <div className="text-sm text-gray-500 mb-6">
              Law ID: {law.law_id}
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
            <div className="text-gray-600 whitespace-pre-wrap">
              {law.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 