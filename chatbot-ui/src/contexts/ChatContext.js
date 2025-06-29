import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import flowConfig from '../config/flowConfig';
import { callGroqAPI, resetConversation } from '../services/groqService';
import { saveUserInfo } from '../services/dbService';

// Create context
const ChatContext = createContext();

// Initial state
const initialState = {
  messages: [],
  currentStep: 'welcome',
  loading: false,
  flowCompleted: false,
  userSelections: {},
  sessionId: null
};

// Action types
const ADD_MESSAGE = 'ADD_MESSAGE';
const SET_CURRENT_STEP = 'SET_CURRENT_STEP';
const SET_LOADING = 'SET_LOADING';
const SET_FLOW_COMPLETED = 'SET_FLOW_COMPLETED';
const RESET_CHAT = 'RESET_CHAT';
const ADD_USER_SELECTION = 'ADD_USER_SELECTION';
const UPDATE_MESSAGES = 'UPDATE_MESSAGES';
const NO_OP = 'NO_OP'; // No operation action for accessing latest state
const SET_SESSION_ID = 'SET_SESSION_ID';

// Add a counter for message IDs
let messageCounter = 0;

// Validation functions
const validateInput = (input, validation) => {
  if (!validation) return true;

  switch (validation.type) {
    case 'string':
      if (validation.allowed) {
        return validation.allowed.includes(input.toLowerCase());
      }
      return true;
    case 'text':
      if (validation.minLength) {
        return input.length >= validation.minLength;
      }
      return true;
    case 'regex':
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        return regex.test(input);
      }
      return true;
    default:
      return true;
  }
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case ADD_MESSAGE:
      const newMessages = [...state.messages, action.payload];
      return {
        ...state,
        messages: newMessages
      };
    case SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case SET_FLOW_COMPLETED:
      return {
        ...state,
        flowCompleted: action.payload
      };
    case ADD_USER_SELECTION:
      return {
        ...state,
        userSelections: {
          ...state.userSelections,
          [action.payload.key]: action.payload.value
        }
      };
    case RESET_CHAT:
      return initialState;
    case UPDATE_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    case SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload
      };
    // No additional cases needed
    case NO_OP:
      // No operation, just return current state
      return state;
    default:
      return state;
  }
};

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  // Use ref to keep track of latest messages for async operations
  const messagesRef = useRef(state.messages);
  
  // Update ref whenever state.messages changes
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  // Add a message from the bot - wrapped in useCallback to prevent dependency changes
  const addBotMessage = useCallback((text) => {
    const botMessageId = `bot-${Date.now()}-${messageCounter++}`;
    
    dispatch({
      type: ADD_MESSAGE,
      payload: {
        id: botMessageId,
        text: text || "",  // Ensure text is never null
        sender: 'bot'
      }
    });
  }, [dispatch]);

  // Initialize the chat
  const initializeChat = useCallback(() => {
    // Reset conversation history in Groq service
    resetConversation();
    
    // Reset state
    dispatch({ type: RESET_CHAT });
    
    // Generate a new session ID
    const sessionId = `session-${Date.now()}`;
    dispatch({ type: SET_SESSION_ID, payload: sessionId });
    
    // Add welcome message
    const welcomeStep = flowConfig.welcome;
    addBotMessage(welcomeStep.message);
    
    // Set next step
    if (welcomeStep.nextStep) {
      dispatch({ type: SET_CURRENT_STEP, payload: welcomeStep.nextStep });
    }
  }, [dispatch, addBotMessage]);
  
  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Add a message from the user
  const addUserMessage = (text) => {
    const userMessageId = `user-${Date.now()}-${messageCounter++}`;
    
    // Create the message object
    const userMessage = {
      id: userMessageId,
      text: text || "",  // Ensure text is never null
      sender: 'user'
    };
    
    // Add user message to state via dispatch
    dispatch({
      type: ADD_MESSAGE,
      payload: userMessage
    });
    
    // Return the message object (useful for testing and verification)
    return userMessage;
  };

  // Add user information
  const addUserInfo = (userInfo) => {
    dispatch({
      type: ADD_USER_SELECTION,
      payload: {
        key: 'userInfo',
        value: userInfo
      }
    });

  };
  
  // Add user contact information
  const addUserContactInfo = (contactInfo) => {
    dispatch({
      type: ADD_USER_SELECTION,
      payload: {
        key: 'contactInfo',
        value: contactInfo
      }
    });

  };
  
  // Generate a summary of user selections
  const generateSelectionSummary = () => {
    const selections = state.userSelections;
    let summary = "Here's a summary of your information:\n";
    
    // Add name if available
    if (selections.name) {
      summary += `Name: ${selections.name}\n`;
    }
    
    // Add email if available
    if (selections.email) {
      summary += `Email: ${selections.email}\n`;
    }
    
    // Add phone if available
    if (selections.phone) {
      summary += `Phone: ${selections.phone}\n`;
    }
    
    // Add other selections as needed
    Object.entries(selections).forEach(([key, value]) => {
      // Skip already added fields and internal fields
      if (!['name', 'email', 'phone', 'userInfo', 'contactInfo'].includes(key)) {
        summary += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
      }
    });
    
    return summary;
  };
  
  // The resetChat function is already defined below

  // Handle user input (text or option selection)
  const handleUserInput = async (input, inputType = 'text') => {
    // Validate input
    if (!input) {
      return;
    }
    
    // Add the user message to chat first
    const userMessage = addUserMessage(input);
    
    // Editing functionality has been removed
    
    // Store user selection for normal flow
    dispatch({
      type: ADD_USER_SELECTION,
      payload: {
        key: state.currentStep,
        value: input
      }
    });
    
    // Process next step based on the current step configuration
    const currentStepConfig = flowConfig[state.currentStep];
    
    if (!currentStepConfig) {
      return;
    }

    // Validate input if validation rules exist
    if (currentStepConfig.validation && !validateInput(input, currentStepConfig.validation)) {
      addBotMessage("Invalid input. Please try again.");
      return;
    }

    // Handle different types of current steps
    if (currentStepConfig.type === 'options') {
      // Find selected option
      const selectedOption = currentStepConfig.options.find(
        option => option.text === input || option.value === input
      );

      if (selectedOption && selectedOption.nextStep) {
        processNextStep(selectedOption.nextStep);
      }
    } else if (currentStepConfig.type === 'input' && currentStepConfig.nextStep) {
      processNextStep(currentStepConfig.nextStep);
    } else if (currentStepConfig.type === 'open_chat') {
      // Check if it's an exit command
      const exitCommands = ["bye", "exit", "quit", "end", "close", "restart"];
      if (exitCommands.includes(input.toLowerCase())) {
        processNextStep("conversation_exit");
        return;
      }
      
      // Force a render with the user message before calling Groq
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Handle open chat with Groq API
      await handleGroqChat(input, userMessage);
    }
  };

  // Process the next step in the flow
  const processNextStep = (nextStepId) => {
    const nextStep = flowConfig[nextStepId];
    
    if (!nextStep) {
      return;
    }

    // Check if we need to reset the conversation (when "No, start over" is clicked)
    if (nextStepId === 'welcome' && state.currentStep === 'verify_selections') {
      // Reset the user selections
      dispatch({ type: RESET_CHAT });
      
      // Generate a new session ID
      const sessionId = `session-${Date.now()}`;
      dispatch({ type: SET_SESSION_ID, payload: sessionId });
    }
    
    // Check if this is the submit_to_database step and submit user data
    if (nextStepId === 'submit_to_database') {
      // This is where we submit all collected user data to the database
      // Only submit when user explicitly confirms by clicking "Yes, submit my information"

      submitToDatabase(state.userSelections);
    }

    // Set current step to next step
    dispatch({ type: SET_CURRENT_STEP, payload: nextStepId });

    if (nextStep.message) {
      addBotMessage(nextStep.message);
    }
    
    // Handle special steps
    if (nextStepId === 'conversation_exit') {
      // Just exit the conversation

    }
      
    // Handle different step types
    switch (nextStep.type) {
      case 'message':
        // For simple messages, proceed to next step after delay if specified
        if (nextStep.nextStep) {
          setTimeout(() => {
            processNextStep(nextStep.nextStep);
          }, 1000);
        }
        break;
        
      case 'options':
      case 'input':
      case 'dynamic_options':
        // For options and input, wait for user input (don't auto-proceed)
        // The handleUserInput function will handle proceeding to the next step
        break;
        
      case 'open_chat':
        // Mark flow as completed
        dispatch({ type: SET_FLOW_COMPLETED, payload: true });
        break;
        
      default:

    }
  };

  // Handle Groq AI chat
  const handleGroqChat = async (userInput, userMessage) => {
    dispatch({ type: SET_LOADING, payload: true });
    
    // Add loading message
    const loadingMsgId = `bot-${Date.now()}-${messageCounter++}`;
    const loadingMessage = {
      id: loadingMsgId,
      text: "",
      sender: 'bot',
      isLoading: true
    };
    
    dispatch({
      type: ADD_MESSAGE,
      payload: loadingMessage
    });
    
    try {
      // Call Groq API with user selections for context
      const response = await callGroqAPI(userInput, state.userSelections);
      
      // Create new bot message
      const botResponse = {
        id: `bot-${Date.now()}-${messageCounter++}`,
        text: response || "No response received",  // Handle empty response
        sender: 'bot'
      };
      
      // Use the ref to get the latest messages
      const currentMessages = messagesRef.current;
      
      // Update messages array by filtering out the loading message and adding the response
      const updatedMessages = currentMessages
        .filter(msg => msg.id !== loadingMsgId)
        .concat(botResponse);
      
      dispatch({
        type: UPDATE_MESSAGES,
        payload: updatedMessages
      });
      
      dispatch({ type: SET_LOADING, payload: false });
    } 
    catch (error) {
      // Create error message
      const errorMessage = {
        id: `bot-${Date.now()}-${messageCounter++}`,
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        isError: true
      };
      
      // Use the ref to get the latest messages
      const currentMessages = messagesRef.current;
      
      // Update messages array by filtering out the loading message and adding the error message
      const updatedMessages = currentMessages
        .filter(msg => msg.id !== loadingMsgId)
        .concat(errorMessage);
      
      dispatch({
        type: UPDATE_MESSAGES,
        payload: updatedMessages
      });
      
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Reset the chat
  const resetChat = () => {
    initializeChat();
  };

  // Submit user information to the database
  const submitToDatabase = async (userInfo) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Save the user information
      const saveResponse = await saveUserInfo(userInfo);
      
      dispatch({ type: SET_LOADING, payload: false });
      

      
      // Show success message
      addBotMessage("Your information has been saved successfully. Thank you!");
      
    } catch (error) {
      console.error('Error submitting to database:', error);
      addBotMessage("There was an error saving your information. Please try again later.");
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Context value
  const value = {
    messages: state.messages,
    currentStep: state.currentStep,
    loading: state.loading,
    flowCompleted: state.flowCompleted,
    userSelections: state.userSelections,
    sessionId: state.sessionId,
    verificationComplete: state.verificationComplete,
    addUserMessage,
    addBotMessage,
    handleUserInput,
    addUserInfo, 
    addUserContactInfo,
    resetChat,
    generateSelectionSummary,
    getCurrentStepConfig: () => flowConfig[state.currentStep] || {}
  };



  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;