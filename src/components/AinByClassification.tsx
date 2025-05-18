import React from 'react';
import BackButton from './BackButton';

const AinByClassification = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
              <BackButton />

      <h1 className="text-3xl font-bold mb-6">वर्गीकरण अनुसार ऐनहरू</h1>
      <p>
        ऐनहरूलाई नियम, नीति, निर्देशिका, आदेश आदि विभिन्न प्रकारमा वर्गीकरण गरिन्छ। यसले कानुनी प्रक्रिया र कार्यान्वयनलाई सहज बनाउँछ।
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>नियमहरू:</strong> कार्यान्वयन र प्रशासनका लागि जारी गरिने कानुनी प्रावधानहरू।</li>
        <li><strong>नीतिहरू:</strong> सरकारको दीर्घकालीन योजना र सिद्धान्तहरू।</li>
        <li><strong>निर्देशिकाहरू:</strong> प्रशासनिक नियमहरूको व्याख्या र दिशा निर्देश।</li>
        <li><strong>आदेशहरू:</strong> तत्काल लागू हुने सरकारी वा न्यायिक आदेशहरू।</li>
      </ul>
    </div>
  );
};

export default AinByClassification;
