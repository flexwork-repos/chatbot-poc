import React from 'react';
import { animated } from 'react-spring';
import './ChatOptions.css';
import { useSpring } from 'react-spring';

const ChatOptions = ({ options = [], onSelect }) => {
  const fadeIn = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 200, friction: 20 }
  });

  return (
      <animated.div style={fadeIn} className="chat-options">
    {options.map(option => (
      <button
        key={option.value}
        className="option-button"
        onClick={() => onSelect(option.text)}
      >
        {option.text}
      </button>
    ))}
  </animated.div>
  );
};

export default ChatOptions;
