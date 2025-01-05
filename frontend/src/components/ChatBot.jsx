import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { token } = useAuth();
  const userId = useRef('user_' + Math.random().toString(36).substr(2, 9)).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (token) {
      handleInitialMessage();
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInitialMessage = async () => {
    try {
      const response = await fetch('https://skincare-chatbot-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          message: ''
        }),
      });
      
      const data = await response.json();
      if (data.message) {
        setMessages([{
          type: 'bot',
          content: data.message
        }]);
        
        if (data.options) {
          setOptions(data.options);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([{
        type: 'bot',
        content: 'Maaf, terjadi kesalahan. Silakan refresh halaman.'
      }]);
    }
  };

  const handleSend = async (messageText) => {
    if (!token || !messageText.trim()) return;

    setIsLoading(true);
    const newMessages = [...messages, {
      type: 'user',
      content: messageText
    }];
    setMessages(newMessages);
    setInput('');
    setOptions([]);

    try {
      const response = await fetch('https://skincare-chatbot-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          message: messageText
        }),
      });
      
      const data = await response.json();
      
      if (data.message) {
        setMessages([...newMessages, {
          type: 'bot',
          content: data.message,
          recommendations: data.recommendations
        }]);

        if (data.options) {
          setOptions(data.options);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
        <div className="flex-1 bg-gray-800 rounded-lg shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="text-blue-400" />
              SkinCare Assistant
            </h2>
          </div>
  
          {/* Chat Messages dengan background yang fixed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <p className="text-white whitespace-pre-line">{message.content}</p>
                  {message.recommendations && message.recommendations.sunscreen?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recommendations.sunscreen.map((rec, idx) => (
                        <div key={idx} className="border-t border-gray-600 pt-2">
                          <h3 className="font-medium">{rec.name}</h3>
                          <p className="text-blue-300">{rec.price}</p>
                          <p className="text-gray-300 text-sm">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
  
          {/* Quick reply options */}
          {options.length > 0 && (
            <div className="p-4 border-t border-gray-700 flex flex-wrap gap-2 bg-gray-800">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(option)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
  
          {/* Input area */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend(input)}
                placeholder="Ketik pesan..."
                disabled={isLoading}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;