import React from 'react';
import BackButton from './BackButton';

const AinOutsideSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
              <BackButton />

      <h1 className="text-3xl font-bold mb-6">खण्ड बाहेकका ऐनहरू</h1>
      <p>
        यी ऐनहरू कानूनका विशेष क्षेत्रहरू वा विशिष्ट विषयहरू समेट्छन् जसलाई खण्डमा राख्न नमिल्ने स्थिति हुन्छ। उदाहरणहरू:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>नेपाल सरकार गठन सम्बन्धी ऐनहरू</li>
        <li>सुरक्षा सम्बन्धी ऐनहरू</li>
        <li>प्राकृतिक स्रोत संरक्षण ऐनहरू</li>
        <li>महत्त्वपूर्ण राष्ट्रिय परियोजना ऐनहरू</li>
      </ul>
      <p>
        यी ऐनहरू प्रायः विशिष्ट परिस्थिति र आवश्यकताका लागि तयार गरिन्छन्।
      </p>
    </div>
  );
};

export default AinOutsideSection;
