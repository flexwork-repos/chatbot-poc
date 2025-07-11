import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { animated } from 'react-spring';
import './ChatInput.css';

const ChatInput = ({ placeholder = "Type your message...", inputType = "text", placeholderAnimation = null }) => {
  const [input, setInput] = useState('');
  const { handleUserInput, loading } = useChat();
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Focus input when loading state changes
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Adjust textarea height automatically
    if (inputType === 'textarea' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    
    if (!trimmedInput || loading) {
      return;
    }
    
    // Now call the context method to handle the actual submission
    handleUserInput(trimmedInput);
    
    // Clear the input field after submission
    setInput('');
    
    // Reset textarea height
    if (inputType === 'textarea' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Focus the input field after submission
    if (inputType === 'textarea' && textareaRef.current) {
      textareaRef.current.focus();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (for text inputs and textarea with shift key modifier)
    if (e.key === 'Enter') {
      if (inputType === 'textarea' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      } else if (inputType !== 'textarea') {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      {inputType === 'text' ? (
        placeholderAnimation ? (
          <animated.input
            ref={inputRef}
            type="text"
            className="form-control animated-placeholder"
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={placeholderAnimation}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        )
      ) : (
        placeholderAnimation ? (
          <animated.textarea
            ref={textareaRef}
            className="form-control animated-placeholder"
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows="1"
            style={placeholderAnimation}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className="form-control"
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows="1"
          />
        )
      )}
      <button 
        type="submit"
        className="btn send-button"
        disabled={!input.trim() || loading}
      >
        <i className="bi bi-send-fill"></i>
      </button>
    </form>
  );
};

export default ChatInput;