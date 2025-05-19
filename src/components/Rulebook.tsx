import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import axios from 'axios';

interface Law {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: {
    mainType: string;
    subType: string | null;
  };
  law_id: number;
}

const Rulebook = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLaws = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/laws', {
          params: {
            type: 'नियमावली'
          }
        });
        setLaws(response.data);
      } catch (error) {
        console.error('Failed to fetch laws:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLaws();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BackButton />

      <h1 className="text-3xl font-bold mb-6">नियमावली</h1>
      <p>
        नियमावलीले कुनै संस्था वा कानूनको सानो तर महत्वपूर्ण प्रावधानहरू निर्धारण गर्छ जसले दैनिक कार्यहरूलाई व्यवस्थित गर्दछ। यी प्रायः कानूनको कार्यान्वयन गर्ने तरिका र मापदण्डहरू समावेश गर्छ।
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">नियमावलीका प्रकारहरू</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>प्रशासनिक नियमावली</li>
        <li>कार्यालयीन नियमावली</li>
        <li>आदर्श आचारसंहिताका नियमावली</li>
      </ul>

      {/* Laws Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">नियमावलीहरू</h2>
        {isLoading ? (
          <div className="text-center text-gray-600">लोड हुँदैछ...</div>
        ) : laws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {laws.map((law) => (
              <div
                key={law._id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {law.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {law.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {law.type.mainType}
                  </span>
                  {law.type.subType && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {law.type.subType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            कुनै नियमावली भेटिएन
          </div>
        )}
      </div>
    </div>
  );
};

export default Rulebook;
