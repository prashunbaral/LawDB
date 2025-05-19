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

const Chairman = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLaws = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/laws', {
          params: {
            type: 'अध्यक्ष'
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

      <h1 className="text-3xl font-bold mb-6">अध्यक्ष</h1>
      <p>
        नेपाल सरकारको विभिन्न निकायमा अध्यक्षको भूमिकामा नियुक्त व्यक्ति कानूनी, प्रशासनिक, र राजनीतिक कार्यहरू संचालन गर्छन्। अध्यक्षले बैठक सञ्चालन गर्ने, निर्णय लिन सहयोग गर्ने र संगठनलाई मार्गदर्शन गर्ने कार्य गर्छन्।
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">मुख्य जिम्मेवारीहरू</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>बैठक सञ्चालन गर्नु र एजेंडा निर्धारण गर्नु।</li>
        <li>निर्णय प्रक्रियामा मध्यस्थता गर्नु।</li>
        <li>संगठनको प्रतिनिधित्व गर्नु।</li>
        <li>नीति निर्माणमा सहयोग गर्नु।</li>
      </ul>

      {/* Laws Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">अध्यक्ष सम्बन्धी कानुनहरू</h2>
        
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
            कुनै अध्यक्ष सम्बन्धी कानुन भेटिएन
          </div>
        )}
      </div>
    </div>
  );
};

export default Chairman;
