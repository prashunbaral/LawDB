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

const RecentAin = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLaws = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/laws', {
          params: {
            type: 'ऐन',
            subType: 'हालसालैका ऐन'
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

      <h1 className="text-3xl font-bold mb-6">हालसालैका ऐनहरू</h1>
      <p className="mb-4">
        हालै नेपाल सरकारले पारित गरेका केही महत्वपूर्ण ऐनहरू तल प्रस्तुत गरिएको छ:
      </p>

      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>नेपाल नागरिकता ऐन, २०६३:</strong> नागरिकताको नियमहरू निर्धारण गर्ने ऐन, जसले राष्ट्रियता र नागरिकताको विषयमा स्पष्ट व्याख्या गरेको छ।
        </li>
        <li>
          <strong>नेपाल दण्ड संहिता, २०७४:</strong> अपराध र सजायको सम्बन्धमा नयाँ कानुन जसले आपराधिक व्यवहार नियन्त्रण र न्याय सुनिश्चित गर्दछ।
        </li>
        <li>
          <strong>नेपाल श्रम ऐन, २०७४:</strong> कामदारको अधिकार संरक्षण, रोजगार सम्बन्धी व्यवस्था र श्रमिकहरूको हितमा नयाँ नियमहरू समावेश गर्दछ।
        </li>
        <li>
          <strong>नेपाल शिक्षा ऐन, २०६३:</strong> शिक्षा प्रणाली सुधार र गुणस्तर सुधार्न लक्ष्यित कानुन।
        </li>
      </ul>

      <p>
        यी ऐनहरू नेपालका सामाजिक, आर्थिक र न्यायिक क्षेत्रमा सुधार ल्याउन महत्वपूर्ण भूमिका निर्वाह गरेका छन्।
      </p>

      {/* Laws Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">हालसालैका ऐनहरू</h2>
        
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
            कुनै हालसालैका ऐन भेटिएन
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAin;
