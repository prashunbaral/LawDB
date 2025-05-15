import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
    >
      ← Back
    </button>
  );
};

export default BackButton;
