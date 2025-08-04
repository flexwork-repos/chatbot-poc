import axios from 'axios';

// Configuration for the optimized backend API
// Use window.location.hostname to make it work on both local and mobile devices
// For ngrok URLs, we need to handle them specially
const isNgrok = window.location.hostname.includes('ngrok');

// const API_BASE_URL = 'https://devapi.flex-work.in/flexwork-api/v1/chatbot';
// https://devapi.flex-work.in/cb
/**
 * Save user information to the database
 * @param {Object} userInfo - Object containing user information (name, email, phone, etc.)
 * @returns {Promise} - Promise with the API response
 */
export const saveUserInfo = async (userInfo) => {
  try {
    // Format the data to match the user_selections table schema
    const formattedUserSelections = {
      // Use existing sessionId or it will be generated on the backend
      "sessionId": "session-1746889595442",
      // sessionId: userInfo.sessionId || undefined,
      
      // Extract user selections for the backend
      userSelections: JSON.stringify({
        // Basic user info
        
        name: userInfo.name || (userInfo.contactInfo?.name || ''),
        email: userInfo.email || (userInfo.contactInfo?.email || ''),
        phone: userInfo.phone || (userInfo.contactInfo?.phone || ''),
        
        // Common fields
        role: userInfo.role || '',
        work_mode: userInfo.workMode || userInfo.work_mode || '',
        
        // Employer specific fields
        skills: userInfo.skills || '',
        employer_headcount_consultant: userInfo.employerHeadcountConsultant || userInfo.employer_headcount_consultant || '',
        employer_project_size_consultant: userInfo.employerProjectSizeConsultant || userInfo.employer_project_size_consultant || '',
        employer_service: userInfo.employerService || userInfo.employer_service || '',
        employer_start_time_consultant: userInfo.employerStartTimeConsultant || userInfo.employer_start_time_consultant || '',
        employer_work_mode_consultant: userInfo.employerWorkModeConsultant || userInfo.employer_work_mode_consultant || '',
        
        // Student and freelancer fields
        student_option: userInfo.studentOption || userInfo.student_option || '',
        student_training: userInfo.studentTraining || userInfo.student_training || '',
        freelancer_category: userInfo.freelancerCategory || userInfo.freelancer_category || '',
        
        // Include any additional fields from contact info
        contactInfo: {
          ...userInfo.contactInfo
        },
      })
      
    };
    
    // Use the new API endpoint that matches the backend

// formattedUserSelections
    const response = await axios.post(`${process.env.API_BASE_URL}/user/captures`, formattedUserSelections);
    return response.data;
  } catch (error) {
    console.error('Error saving user information:', error);
    throw error;
  }
};

// Legacy function - kept for backward compatibility
export const saveUserSelections = saveUserInfo;
