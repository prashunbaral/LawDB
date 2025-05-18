import React from 'react';
import BackButton from './BackButton';

const Chairman = () => {
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
    </div>
  );
};

export default Chairman;
