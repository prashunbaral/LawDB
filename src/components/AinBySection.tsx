import React from 'react';
import BackButton from './BackButton';

const AinBySection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
              <BackButton />

      <h1 className="text-3xl font-bold mb-6">खण्ड अनुसार ऐनहरू</h1>
      <p className="mb-4">
        ऐनहरूलाई विभिन्न खण्डहरूमा विभाजन गरी कानूनको विभिन्न क्षेत्रहरूमा लागु गरिन्छ। तल केही प्रमुख खण्डहरूमा आधारित ऐनहरूको उदाहरणहरू छन्:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>सामाजिक न्याय खण्ड:</strong> दलित, महिला, आदिवासी जनजाति अधिकार संरक्षण ऐनहरू।</li>
        <li><strong>आर्थिक खण्ड:</strong> कर, उद्योग, वाणिज्य ऐनहरू।</li>
        <li><strong>आपराधिक खण्ड:</strong> अपराध, सजाय र प्रहरी ऐनहरू।</li>
        <li><strong>शिक्षा र स्वास्थ्य खण्ड:</strong> विद्यालय, अस्पताल, स्वास्थ्य सेवा ऐनहरू।</li>
      </ul>
      <p>
        खण्ड अनुसारको वर्गीकरणले कानूनलाई सजिलै बुझ्न र लागु गर्न सहयोग पुर्याउँछ।
      </p>
    </div>
  );
};

export default AinBySection;
