import axios from 'axios';

// Configuration for the optimized backend API
// Use window.location.hostname to make it work on both local and mobile devices
// For ngrok URLs, we need to handle them specially
const isNgrok = window.location.hostname.includes('ngrok');

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : isNgrok
    ? window.location.protocol + '//' + window.location.hostname + '/api'
    : window.location.protocol + '//' + window.location.hostname + ':3001/api';

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
      sessionId: userInfo.sessionId || undefined,
      
      // Extract user selections for the backend
      userSelections: {
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
        ...userInfo.contactInfo
      }
    };
    
    // Use the new API endpoint that matches the backend
    const response = await axios.post(`${API_BASE_URL}/user-selections`, formattedUserSelections);
    return response.data;
  } catch (error) {
    console.error('Error saving user information:', error);
    throw error;
  }
};

// Legacy function - kept for backward compatibility
export const saveUserSelections = saveUserInfo;
