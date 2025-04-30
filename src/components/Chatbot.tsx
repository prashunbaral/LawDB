import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GEMINI_API_KEY = 'AIzaSyDvlKkCl9oXKQASLsXYn4BhrJI2u4jyc-c';

const CATEGORIES = ['constitutional', 'civil', 'criminal', 'commercial', 'corporate'];

function extractCategory(prompt: string): string | null {
  // Look for a known category in the prompt
  const lower = prompt.toLowerCase();
  for (const cat of CATEGORIES) {
    if (lower.includes(cat)) return cat;
  }
  return null;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; laws?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    // Extract category from prompt
    const category = extractCategory(userMsg.text);
    if (!category) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Please specify a valid law category: constitutional, civil, criminal, commercial, or corporate.' },
      ]);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/laws', { params: { category } });
      if (res.data && res.data.length > 0) {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: 'ai',
            text: `Here ${res.data.length === 1 ? 'is' : 'are'} ${category} law${res.data.length === 1 ? '' : 's'}:`,
            laws: res.data,
          },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: 'ai', text: `Sorry, I couldn't find any ${category} laws.` },
        ]);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'There was an error searching for laws.' },
      ]);
    }
    setLoading(false);
  };

  const handleLawClick = (lawId: number) => {
    setOpen(false);
    navigate(`/law/${lawId}`);
  };

  // Overlay close on outside click
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

      {/* Overlay */}
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
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f9fafb' }}>
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
                  }}>
                    {msg.text}
                  </div>
                  {/* Law links */}
                  {msg.laws && (
                    <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {msg.laws.map(law => (
                        <li key={law.law_id}>
                          <button
                            onClick={() => handleLawClick(law.law_id)}
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
              {loading && <div style={{ color: '#888', fontSize: 14 }}>Thinking...</div>}
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
                placeholder="Ask about a law..."
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