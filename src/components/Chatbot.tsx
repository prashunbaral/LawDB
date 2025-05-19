import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['constitutional', 'civil', 'criminal', 'commercial', 'corporate'];

// Common greetings in English and Nepali
const GREETINGS = [
  'hi', 'hello', 'hey', 'namaste', 'namaskar', 'good morning', 'good afternoon', 'good evening',
  'नमस्ते', 'नमस्कार', 'हाइ', 'हेलो'
];

// Add mapping for Nepali types/subtypes and their routes
const NEPALI_TYPE_ROUTE_MAP: Record<string, string> = {
  'नियमावली': '/laws/rulebook',
  'अध्यक्ष': '/laws/chairman',
  'संविधान': '/laws/constitutional',
  'ऐन': '/laws/ain',
  '(गठन) आदेश': '/laws/formation-orders',
  // Add more as needed
};

function isGreeting(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  return GREETINGS.some(greeting => lowerText === greeting);
}

function extractCategory(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const cat of CATEGORIES) {
    if (lower.includes(cat)) return cat;
  }
  return null;
}

function extractNepaliType(prompt: string): string | null {
  // Check for exact match or inclusion of Nepali type keywords
  for (const type in NEPALI_TYPE_ROUTE_MAP) {
    if (prompt.includes(type)) return type;
  }
  return null;
}

function extractLawKeywords(prompt: string): string[] {
  // Common legal terms and keywords in both English and Nepali
  const legalTerms = [
    // English terms
    'law', 'legal', 'rights', 'court', 'judge', 'case', 'trial', 'evidence',
    'contract', 'agreement', 'property', 'crime', 'criminal', 'civil', 'constitutional',
    'commercial', 'corporate', 'tax', 'family', 'marriage', 'divorce', 'inheritance',
    'property', 'business', 'company', 'employment', 'labor', 'intellectual', 'patent',
    'copyright', 'trademark', 'accident', 'injury', 'damage', 'compensation',
    // Nepali terms
    'कानुन', 'कानून', 'ऐन', 'कानुनी', 'अधिकार', 'अदालत', 'न्याय', 'मुद्दा',
    'सबूत', 'सम्झौता', 'सम्पत्ति', 'अपराध', 'दीवानी', 'संवैधानिक', 'व्यावसायिक',
    'कम्पनी', 'रोजगार', 'श्रम', 'बौद्धिक', 'पेटेन्ट', 'कपिराइट', 'ट्रेडमार्क',
    'दुर्घटना', 'चोट', 'क्षति', 'मुआवजा', 'ढाँचा', 'संरचना', 'निर्माण'
  ];

  const words = prompt.toLowerCase().split(/\s+/);
  return words.filter(word => legalTerms.includes(word));
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; laws?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  const searchLaws = async (query: string, category?: string) => {
    try {
      console.log('Searching laws with query:', query, 'category:', category);
      const response = await axios.get('http://localhost:5000/api/laws', {
        params: { 
          query: query,
          category: category?.toLowerCase()
        }
      });
      console.log('Search results:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching laws:', error);
      return [];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user' as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check for greetings first
      if (isGreeting(userMsg.text)) {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: 'ai',
            text: "नमस्ते! म तपाईंलाई कानुन सम्बन्धी जानकारी दिन मद्दत गर्न सक्छु। कृपया कुन कानुनको बारेमा जान्न चाहनुहुन्छ?"
          }
        ]);
        setLoading(false);
        return;
      }

      // Extract Nepali type
      const nepaliType = extractNepaliType(userMsg.text);
      let relevantLaws = [];
      let responseText = '';

      if (nepaliType) {
        // Fetch laws by Nepali type
        relevantLaws = await searchLaws('', undefined);
        // Filter client-side for exact type match (in case backend doesn't support direct Nepali type param)
        relevantLaws = relevantLaws.filter((law: any) => law.type?.mainType === nepaliType);
        if (relevantLaws.length > 0) {
          responseText = `यहाँ ${nepaliType} सम्बन्धी कानुनहरू छन्:`;
        }
      }

      // If no results from Nepali type search, try category search
      if (relevantLaws.length === 0 && !nepaliType) {
        // Extract category and keywords
        const category = extractCategory(userMsg.text);
        const keywords = extractLawKeywords(userMsg.text);
        // First try category search
        if (category) {
          console.log('Searching by category:', category);
          relevantLaws = await searchLaws('', category);
          if (relevantLaws.length > 0) {
            responseText = `Here are the ${category} laws in our database:`;
          }
        }
        // If no results from category search, try keyword search
        if (relevantLaws.length === 0 && keywords.length > 0) {
          console.log('Searching by keywords:', keywords);
          relevantLaws = await searchLaws(keywords.join(' '));
          if (relevantLaws.length > 0) {
            responseText = `Here are the laws related to ${keywords.join(', ')}:`;
          }
        }
        // If still no results, try searching with the original query
        if (relevantLaws.length === 0) {
          console.log('Searching with original query:', userMsg.text);
          relevantLaws = await searchLaws(userMsg.text);
          if (relevantLaws.length > 0) {
            responseText = `Here are the laws related to your query:`;
          }
        }
      }

      // If no laws found at all
      if (relevantLaws.length === 0) {
        responseText = "माफ गर्नुहोस्, तपाईंको खोजीमा कुनै कानुन भेटिएन। कृपया अर्को खोजी शब्द वा श्रेणी प्रयोग गर्नुहोस्।";
      }

      setMessages((msgs) => [
        ...msgs,
        {
          sender: 'ai',
          text: responseText,
          laws: relevantLaws
        }
      ]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages((msgs) => [
        ...msgs,
        { 
          sender: 'ai', 
          text: "माफ गर्नुहोस्, केही समस्या भयो। कृपया पुन: प्रयास गर्नुहोस्।" 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLawClick = (law: any) => {
    // If law.type.mainType is a known Nepali type, use mapped route
    const nepaliType = law.type?.mainType;
    if (nepaliType && NEPALI_TYPE_ROUTE_MAP[nepaliType]) {
      setOpen(false);
      navigate(NEPALI_TYPE_ROUTE_MAP[nepaliType]);
    } else {
      setOpen(false);
      navigate(`/law/${law.law_id}`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  return (
    <>
      {/* Floating AI button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          cursor: 'pointer',
        }}
        aria-label="Open AI Chatbot"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
      </button>

      {/* Chat overlay */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: '100vw',
              height: 480,
              background: 'white',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              margin: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 18, background: '#f8fafc' }}>
              AI Law Assistant
              <button onClick={() => setOpen(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 16, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  <div style={{
                    display: 'inline-block',
                    background: msg.sender === 'user' ? '#2563eb' : '#e0e7ef',
                    color: msg.sender === 'user' ? 'white' : '#222',
                    borderRadius: 16,
                    padding: '10px 16px',
                    maxWidth: 240,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                  {/* Law links */}
                  {msg.laws && msg.laws.length > 0 && (
                    <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {msg.laws.map(law => (
                        <li key={law.law_id}>
                          <button
                            onClick={() => handleLawClick(law)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: 15,
                              padding: 0,
                              margin: '4px 0',
                            }}
                          >
                            {law.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {loading && <div style={{ color: '#888', fontSize: 14 }}>Searching laws...</div>}
            </div>

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', borderTop: '1px solid #eee', background: '#fff' }}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Search laws by category or keywords..."
                style={{ flex: 1, border: 'none', outline: 'none', padding: 16, fontSize: 16, background: 'transparent' }}
                disabled={loading}
              />
              <button
                type="submit"
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0 20px', fontSize: 16, cursor: 'pointer', borderRadius: 0 }}
                disabled={loading}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 