import React, { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import ChatMessages from '../ChatMessages/ChatMessages';
import ChatInput from '../ChatInput/ChatInput';
import ChatOptions from '../ChatOptions/ChatOptions';
import MobileVerification from '../VerificationWindow/MobileVerification'
import { useChat } from '../../contexts/ChatContext';
import './ChatBotWindow.css';
import robotPng from '../assets/robot.png';

const ChatBotWindow = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Placeholder toggle state
  const [placeholderToggle, setPlaceholderToggle] = useState(false);

  const {
    flowCompleted,
    handleUserInput,
    addUserContactInfo,
    getCurrentStepConfig
  } = useChat();

  // Animated placeholder text using React Spring
  const placeholderAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(5px)' },
    reset: placeholderToggle,
    config: { tension: 280, friction: 20 }
  });

  const placeholderText = flowCompleted
    ? (placeholderToggle
      ? "Ask me anything about Flexwork..."
      : "Type bye or exit to end conversation")
    : "Type your response...";

  // Toggle placeholder every 3 seconds when flowCompleted
  useEffect(() => {
    let interval;
    if (flowCompleted) {
      interval = setInterval(() => {
        setPlaceholderToggle((prev) => !prev);
      }, 3000);
    } else {
      setPlaceholderToggle(false);
    }
    return () => interval && clearInterval(interval);
  }, [flowCompleted]);

  // Performance optimized animation for the chat window
  const chatAnimation = useSpring({
    // opacity: isOpen ? 1 : 0,
    // transform: isOpen ? 'scale(1)' : 'scale(0.5)',
    transformOrigin: 'bottom right',
    config: config.gentle // Using predefined gentle config for smoother animation
  });

  const handleVerificationComplete = (contactData) => {
    setIsVerified(true);

    // Extract contact information
    const contactInfo = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      contactMethod: contactData.contactMethod,
      contactValue: contactData.contactValue
    };

    // Pass all contact information to the context
    addUserContactInfo(contactInfo);
  };

  const currentStepConfig = getCurrentStepConfig();

  return (
    <>

      <animated.div
        className="chatbot shadow-lg"
        style={chatAnimation}
      >
        {!isVerified ? (
          <MobileVerification onProceedToBot={handleVerificationComplete} />
        ) : (
          <div className="card border-0 h-100">
            <div className="card-header bg-gradient-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <img
                  src={robotPng}
                  alt="Arth-AI chatbot"
                  className="me-2"
                  style={{
                    width: '30px',
                    height: '30px',
                    objectFit: 'contain'
                  }}
                />
                Flexwork AI Assistant
                {/* <button
                    className="btn-close btn-close-white ms-auto"
                    onClick={toggleChatbot}
                    aria-label="Close"
                  ></button> */}
              </h5>
            </div>

            <div className="card-body p-0 d-flex flex-column">
              <ChatMessages />

              {/* Options area - with performance optimization */}
              {currentStepConfig.type === 'options' && !flowCompleted && (
                <ChatOptions
                  options={currentStepConfig.options || []}
                  onSelect={handleUserInput}
                />
              )}

              {/* Input area - hide when type is final or disableInput is true */}
              {(currentStepConfig.type === 'input' ||
                currentStepConfig.type === 'open_chat' ||
                (flowCompleted && currentStepConfig.type !== 'final' && !currentStepConfig.disableInput)) && (
                  <ChatInput
                    placeholder={flowCompleted ? placeholderText : "Type your response..."}
                    inputType={currentStepConfig.inputType || "text"}
                    placeholderAnimation={flowCompleted ? placeholderAnimation : null}
                  />
                )}
            </div>
          </div>
        )}
      </animated.div>

    </>
  );
};

export default ChatBotWindow;