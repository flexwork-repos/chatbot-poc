import React, { useRef, useEffect } from "react";
import { useTransition, animated } from "react-spring";
import { useChat } from "../../contexts/ChatContext";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import "./ChatMessages.css";



const ChatMessages = () => {
  const { messages } = useChat();
  const messagesEndRef = useRef(null);

  // For debugging, log messages when they change
  useEffect(() => {}, [messages]);

  // Animation for message appearance
  const transitions = useTransition(messages, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0 },
    keys: (message) => message.id || `msg-${Math.random()}`, // Fallback random key
    config: { tension: 280, friction: 20 },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Render thinking animation for loading messages
  const renderThinking = () => (
    <div className="thinking-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  // Function to format message text with line breaks
  const formatMessageText = (text) => {
    if (text === null || text === undefined) {
      console.warn("Received null or undefined message text");
      return "";
    };

    // Convert to string just to be safe
    const textStr = String(text);

    return textStr.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < textStr.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderMessageContent = (text) => {
    if (typeof text === "string" && text.includes("<a")) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return formatMessageText(text);
  };

  // Check if there are messages to render
  if (!messages || messages.length === 0) {
    return (
      <div className="chat-messages">
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {/* Simple debug info */}
      {/* <div className="debug-info" style={{ 
        fontSize: '10px', 
        color: '#999', 
        padding: '5px', 
        backgroundColor: '#f5f5f5', 
        margin: '5px 0'
      }}>
        Total messages: {messages.length}, 
        User messages: {messages.filter(m => m.sender === 'user').length}, 
        Bot messages: {messages.filter(m => m.sender === 'bot').length}
      </div> */}

      {/* Fallback rendering in case transitions don't work */}
      {messages.map((message, index) => (
        <div
          key={message.id || `fallback-${index}`}
          className={`message ${
            message.sender === "user" ? "message-outgoing" : "message-incoming"
          }`}
          style={{ display: "none" }} // Hidden but available for debugging
        >
          <div className="message-content">
            {message.sender}: {message.text}
          </div>
        </div>
      ))}

      {/* Main message rendering */}
      {transitions((style, message, _, index) => (
        <animated.div
          style={style}
          className={`message ${
            message.sender === "user" ? "message-outgoing" : "message-incoming"
          }`}
          key={message.id || `animated-${index}`}
        >
          {/* User avatar */}
          {message.sender === "user" && (
            <div className="avatar user-avatar">
              <FaRegUser />
            </div>
          )}

          {/* Bot avatar */}
          {message.sender === "bot" && (
            <div className="avatar">
              <RiRobot2Line />
            </div>
          )}

          <div className="message-content">
            {message.isLoading
              ? renderThinking()
              : renderMessageContent(message.text)}
          </div>
        </animated.div>
      ))}

      <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
    </div>
  );
};

export default ChatMessages;

// Add these styles to ChatMessages.css
/*
.interactive-icon-container {
  position: absolute;
  top: -15px;
  right: -15px;
  z-index: 10;
}

.interactive-icon {
  cursor: pointer;
  background: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  position: relative;
}

.pulse-effect {
  position: absolute;
  top: -20px;
  right: -5px;
  background: #4a90e2;
  color: white;
  border-radius: 10px;
  padding: 3px 6px;
  font-size: 10px;
  white-space: nowrap;
}

.avatar {
  position: relative;
}
*/
