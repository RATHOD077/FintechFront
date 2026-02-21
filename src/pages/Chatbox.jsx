import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to your backend
const socket = io('http://localhost:5000');

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load chat history
    socket.on('chatHistory', (history) => {
      setMessages(history);
    });

    // Receive bot messages
    socket.on('botMessage', (msg) => {
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Failed to connect to server', sender: 'system', timestamp: new Date().toLocaleTimeString() },
      ]);
    });

    // Cleanup
    return () => {
      socket.off('chatHistory');
      socket.off('botMessage');
      socket.off('connect_error');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '') return;
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    socket.emit('message', input);
    setInput('');
    setIsTyping(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={toggleChatbox}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Chat
        </button>
      )}
      {isOpen && (
        <div className="w-80 h-[400px] bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="text-base font-semibold">Chatbot</h3>
            <div>
              <button
                onClick={clearChat}
                className="text-white text-sm mr-2 hover:text-gray-200"
              >
                Clear
              </button>
              <button
                onClick={toggleChatbox}
                className="text-white text-lg font-bold hover:text-gray-200"
              >
                X
              </button>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-md max-w-[80%] break-words ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : msg.sender === 'bot'
                    ? 'bg-gray-200 text-black mr-auto'
                    : 'bg-red-200 text-black mr-auto' // For system messages
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-2 p-2 rounded-md max-w-[80%] bg-gray-200 text-black mr-auto">
                <span className="animate-pulse">Typing...</span>
              </div>
            )}
          </div>
          <div className="flex p-3 border-t border-gray-300">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;