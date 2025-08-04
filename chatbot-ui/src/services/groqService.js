/**
 * Service to handle Groq API interactions
 * Securely manages API key and provides methods for chat completions
 */

// // Use environment variable for API key
// const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// /**
//  * Get API key from environment variable
//  * In a React app, environment variables must be prefixed with REACT_APP_
//  */
// const getApiKey = () => {
//   return process.env.REACT_APP_GROQ_API_KEY;
// };

/**
 * Maintains conversation context for better responses
 */
class ConversationManager {
  constructor() {
    this.history = [
      {
        role: "system",
        content: "You are Arth-AI, a helpful assistant for Flexwork, a platform that connects freelancers with employers and many other thing for students also. Provide helpful, concise, and friendly responses. Keep your answers focused on Flexwork services and related topics. You are a expert in training programs and training materials.you also help in career counselling and help in finding the right career path for the user."
      }
    ];
    this.maxHistoryLength = 20; // Maximum number of messages to keep in history
  }

  addUserMessage(message) {
    this.history.push({
      role: "user",
      content: message
    });
    this._trimHistory();
  }

  addAssistantMessage(message) {
    this.history.push({
      role: "assistant",
      content: message
    });
    this._trimHistory();
  }

  getHistory() {
    return [...this.history];
  }

  _trimHistory() {
    if (this.history.length > this.maxHistoryLength + 1) { // +1 for system message
      this.history = [
        this.history[0], // Keep system message
        ...this.history.slice(-(this.maxHistoryLength))
      ];
    }
  }

  reset() {
    this.history = [this.history[0]]; // Keep only the system message
  }
}

// Create conversation manager instance
const conversationManager = new ConversationManager();

/**
 * Call Groq API for chat completion
 * @param {string|Array} input - The message from the user or an array of message objects
 * @param {Object} userSelections - Optional user selections from previous steps
 * @returns {Promise<string>} - The AI response
 */
export const callGroqAPI = async (input, userSelections = {}) => {
  // Handle different input types
  let messages;

  // Log selection types but not values for privacy

  
  if (Array.isArray(input)) {
    // Direct prompt array for transcript summary
    messages = input;
  } else {
    // Regular user message
    conversationManager.addUserMessage(input);
    messages = conversationManager.getHistory();
  }

  // Ensure system prompt is always at the start with user selections context
  let systemContent = `You are **Arth-AI**, an expert assistant exclusively for **Flexwork**—a platform that connects freelancers, employers, and students.:

• Only answer questions related to Flexwork’s services, features, pricing, training programs only if you have data otherwise reply with We appreciate your query. This matter needs personal attention. Our team will reach out to you shortly to assist further.
• If career guidance is asked then reply with proper structured response roadmap of career guidance.
• Do not answer questions about the Flexwork website navigation, layout, or technical aspects.
• If a question is outside the scope of Flexwork, reply: “I’m sorry, I can only help with Flexwork-related queries.”
• Use only verified and known information. Do not guess, invent, or assume anything.
• Keep answers friendly, professional, and concise. Focus on actionable guidance and clear next steps.
`;
  
  // Add user selections to system prompt if available
  if (Object.keys(userSelections).length > 0) {
    systemContent += "\n\nUser's previous selections:\n";
    
    // Map step IDs to readable labels
    const labelMap = {
      role: "Role",
      freelancer_category: "Freelancer Category",
      employer_service: "Service Requested",
      employer_project_size_consultant: "Project Size",
      employer_headcount_consultant: "Number of Professionals",
      employer_work_mode_consultant: "Work Mode",
      employer_start_time_consultant: "Start Time",
      skills: "Required Skills",
      trainer_details: "Training Requirements",
      panel_details: "Interview Panel Requirements",
      multiple_hire_details: "Multiple Hiring Needs",
      student_option: "Student Option",
      student_training: "Training Interest",
      student_internship: "Internship Interest",
      student_project: "Project Interest",
      student_upskilling: "Upskilling Interest",
      freelancer_option: "Freelancer Expertise",
      freelancer_experience: "Years of Experience",
      freelancer_availability: "Availability"
    };
    
    // Add each selection to the system prompt
    Object.keys(userSelections).forEach(key => {
      if (labelMap[key] && userSelections[key] !== null && userSelections[key] !== undefined && userSelections[key] !== '') {
        systemContent += `${labelMap[key]}: ${userSelections[key]}\n`;
      }
    });
    
    systemContent += "\nUse this information to provide more personalized responses, but DO NOT mention or reference any personal contact information like email, phone, or name in your responses.";
  }
  
  const systemPrompt = {
    role: "system",
    content: systemContent
  };

  // Always replace the first system message or add it if not present
  if (messages.length && messages[0].role === "system") {
    messages[0] = systemPrompt;
  } else {
    messages = [systemPrompt, ...messages];
  }



  // Determine the base URL based on the current hostname
  // For ngrok URLs, we need to handle them specially
  const isNgrok = window.location.hostname.includes('ngrok');
  
  // const baseUrl = 'https://devapi.flex-work.in/cb'; // DEV
  const baseUrl = 'https://api.flex-work.in/cb'; // PROD
    
  try {
    const response = await fetch(`${baseUrl}/api/groq/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`Flask server error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.content || data.choices?.[0]?.message?.content || data;
    
    // Only add to conversation history if it's a regular user message
    if (!Array.isArray(input)) {
      conversationManager.addAssistantMessage(assistantResponse);
    }
    
    return assistantResponse;
  } catch (err) {

    return "I'm having trouble connecting to the server. Please check your connection or try again later.";
  }
};


/**
 * Reset conversation history
 */
export const resetConversation = () => {
  conversationManager.reset();
};

const groqService = {
  callGroqAPI,
  resetConversation
};

export default groqService; 
