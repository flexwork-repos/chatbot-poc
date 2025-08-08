import axios from 'axios';

// Configuration for the optimized backend API
// Use window.location.hostname to make it work on both local and mobile devices
// For ngrok URLs, we need to handle them specially
const isNgrok = window.location.hostname.includes('ngrok');

// const API_BASE_URL = 'https://devapi.flex-work.in/flexwork-api/v1/chatbot'; // DEV
const API_BASE_URL = 'https://api.flex-work.in/flexwork-api/v1/chatbot'; // PROD
// https://devapi.flex-work.in/cb
/**
 * Save user information to the database
 * @param {Object} userInfo - Object containing user information (name, email, phone, etc.)
 * @returns {Promise} - Promise with the API response
 */
export const saveUserInfo = async (userInfo) => {
  console.log("saveUserInfo : input:> userInfo ==> ", userInfo);
  try {
    // Format the data to match the user_selections table schema
    const formattedUserSelections = {
      // Use existing sessionId or it will be generated on the backend
      "sessionId": "session-1746889595442",
      // sessionId: userInfo.sessionId || undefined,

      // Extract user selections for the backend
      userSelections: JSON.stringify({
        // Basic user info
        ...userInfo,
        name: userInfo.name || (userInfo.contactInfo?.name || ''),
        email: userInfo.email || (userInfo.contactInfo?.email || ''),
        phone: userInfo.phone || (userInfo.contactInfo?.phone || ''),

        // Common fields
        // role: userInfo.role || '',
        // work_mode: userInfo.workMode || userInfo.work_mode || '',

        // Employer specific fields
        // skills: userInfo.skills || '',

        // employer_service: userInfo.employerService || userInfo.employer_service || '',

        // employer_headcount_consultant: userInfo.employerHeadcountConsultant ?? userInfo.employer_headcount_consultant ?? '',
        // employer_project_size_consultant: userInfo.employerProjectSizeConsultant || userInfo.employer_project_size_consultant || '',
        // employer_start_time_consultant: userInfo.employerStartTimeConsultant || userInfo.employer_start_time_consultant || '',
        // employer_work_mode_consultant: userInfo.employerWorkModeConsultant || userInfo.employer_work_mode_consultant || '',

        // employer_headcount_trainer: userInfo.employerHeadcountTrainer || userInfo.employer_headcount_trainer || '',
        // employer_project_size_trainer: userInfo.employerProjectSizeTrainer || userInfo.employer_project_size_trainer || '',
        // employer_start_time_trainer: userInfo.employerStartTimeTrainer || userInfo.employer_start_time_trainer || '',
        // employer_work_mode_trainer: userInfo.employerWorkModeTrainer || userInfo.employer_work_mode_trainer || '',

        // employer_headcount_panel: userInfo.employerHeadcountPanel || userInfo.employer_headcount_panel || '',
        // employer_project_size_panel: userInfo.employerProjectSizePanel || userInfo.employer_project_size_panel || '',
        // employer_start_time_panel: userInfo.employerStartTimePanel || userInfo.employer_start_time_panel || '',
        // employer_work_mode_panel: userInfo.employerWorkModePanel || userInfo.employer_work_mode_panel || '',

        // employer_headcount_multi: userInfo.employerHeadcountMulti || userInfo.employer_headcount_multi || '',
        // employer_project_size_multi: userInfo.employerProjectSizeMulti || userInfo.employer_project_size_multi || '',
        // employer_start_time_multi: userInfo.employerStartTimePanel || userInfo.employer_start_time_multi || '',
        // employer_work_mode_multi: userInfo.employerWorkModePanel || userInfo.employer_work_mode_multi || '',
        // employer_multiple_hire_details: userInfo.multiple_hire_details ?? '',

        // Student and freelancer fields
        // student_option: userInfo.studentOption || userInfo.student_option || '',
        // student_training: userInfo.studentTraining || userInfo.student_training || '',
        // freelancer_category: userInfo.freelancerCategory || userInfo.freelancer_category || '',

        // Include any additional fields from contact info
        contactInfo: {
          ...userInfo.contactInfo
        },
      })

    };
    // formattedUserSelections
    const response = await axios.post(`${API_BASE_URL}/user/captures`, formattedUserSelections);
    return response.data;
  } catch (error) {
    console.error('Error saving user information:', error);
    throw error;
  }
};

// Legacy function - kept for backward compatibility
export const saveUserSelections = saveUserInfo;
