import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { animated } from "react-spring";
import "./ChatInput.css";

const ChatInput = ({
  placeholder = "Type your message...",
  inputType = "text",
  placeholderAnimation = null,
}) => {
  const [input, setInput] = useState("");
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
    if (inputType === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    setInput("");

    // Reset textarea height
    if (inputType === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Focus the input field after submission
    if (inputType === "textarea" && textareaRef.current) {
      textareaRef.current.focus();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (for text inputs and textarea with shift key modifier)
    if (e.key === "Enter") {
      if (inputType === "textarea" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      } else if (inputType !== "textarea") {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      {inputType === "text" ? (
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
      ) : placeholderAnimation ? (
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
      )}
      <button
        type="submit"
        className="btn send-button"
        disabled={!input.trim() || loading}
      >
        {/* <i className="bi bi-send-fill"></i> */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.8325 9.17463L9.10904 14.9592L2.59944 10.8877C1.66675 10.3041 1.86077 8.88744 2.91572 8.57893L18.3712 4.05277C19.3373 3.76963 20.2326 4.67283 19.9456 5.642L15.3731 21.0868C15.0598 22.1432 13.6512 22.332 13.0732 21.3953L9.10601 14.9602"
            stroke="#F3EEE9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
