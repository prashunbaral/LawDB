import React from 'react';
import BackButton from './BackButton';

const FormationOrders = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
              <BackButton />

      <h1 className="text-3xl font-bold mb-6">(गठन) आदेश</h1>
      <p>
        गठन आदेश सरकारी निकाय, संस्था वा समितिहरू गठन गर्ने औपचारिक आदेश हुन्। यी आदेशहरूले संगठनको अधिकार, दायित्व र संरचना निर्धारण गर्दछन्।
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">गठन आदेशका उदाहरणहरू</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>प्रदेश सरकार गठन आदेश</li>
        <li>विशेष आयोग गठन आदेश</li>
        <li>स्थानीय निकाय गठन आदेश</li>
      </ul>
    </div>
  );
};

export default FormationOrders;
