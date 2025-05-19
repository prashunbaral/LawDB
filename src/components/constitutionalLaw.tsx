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

const ConstitutionalLaw = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLaws = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/laws', {
          params: {
            type: 'संविधान'
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

      <h1 className="text-3xl font-bold mb-6">नेपालको संविधान २०७२</h1>

      <p className="mb-4">
        नेपालको संविधान २०७२ (२०१५) नेपालका लागि सर्वोच्च कानुन हो। यो २०४८ सालको संविधानको विकल्प स्वरूप बनेको हो र नेपालको सङ्घीय लोकतान्त्रिक गणतन्त्रलाई स्थापना गर्दछ।
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">संविधानको महत्त्व</h2>
      <p>
        संविधानले सबै नेपाली नागरिकलाई समान अधिकार, स्वतन्त्रता र न्याय सुनिश्चित गर्दछ। यसले सरकारको संरचना, कार्यपालिका, विधायिका र न्यायपालिकाको भूमिकालाई परिभाषित गर्दछ र संघीयता, अधिकार क्षेत्र र अधिकारहरू विस्तार गर्दछ।
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">मुख्य विशेषताहरू</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>संघीय संरचना — नेपाल ७ प्रदेशमा विभाजित।</li>
        <li>लोकतान्त्रिक गणतन्त्रको स्थापना।</li>
        <li>मानवअधिकारहरूको विस्तृत सुनिश्चितता।</li>
        <li>धर्मनिरपेक्षता र समानता।</li>
        <li>महिला, मधेसी, आदिवासी जनजाति, दलित लगायत विभिन्न वर्गका अधिकारहरूको संरक्षण।</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">संविधान सभा</h2>
      <p>
        संविधान सभा सन् २००८ मा गठन भई, लामो समयसम्म चलेको राजनैतिक संघर्ष र द्वन्द्व पछि संविधान तयार पार्ने कार्य सम्पन्न गर्यो। २०७२ साल भदौ ३ गते नेपालको संविधानको घोषणा गरियो।
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">संविधानका अनुच्छेदहरू</h2>
      <p>
        नेपालको संविधान ३५ भाग, ३०८ धारा र ९ अनुसूचीहरू मिलेर बनेको छ। यसले नागरिक अधिकार, राज्य संरचना, प्रदेश र स्थानीय तहको अधिकार र दायित्वहरू समेत स्पष्ट गरेको छ।
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">संविधानको कार्यान्वयन</h2>
      <p>
        संविधान लागू भइसकेपछि नेपालको कानून प्रणालीमा महत्वपूर्ण सुधारहरू भएका छन्। संघीय सरकार, प्रदेश सरकार र स्थानीय सरकारहरूको गठन र अधिकार सीमाहरू कानूनी रूपमा स्थापित भएका छन्।
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">संविधानको सन्दर्भमा चुनौतीहरू</h2>
      <p>
        संघीयताको पूर्ण कार्यान्वयन, मधेसी र थरुहट क्षेत्रका मागहरू, स्थानीय तहको अधिकार विस्तार लगायतका विषयमा विवाद र छलफलहरू भइरहेका छन्। यद्यपि संविधान नै मुलुकको समृद्धि र स्थायित्वको आधार हो।
      </p>

      {/* Laws Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">संविधान सम्बन्धी कानूनहरू</h2>
        
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
            कुनै संविधान सम्बन्धी कानून भेटिएन
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstitutionalLaw;
