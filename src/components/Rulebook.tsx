import React from 'react';
import BackButton from './BackButton';

const Rulebook = () => {
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
    </div>
  );
};

export default Rulebook;
