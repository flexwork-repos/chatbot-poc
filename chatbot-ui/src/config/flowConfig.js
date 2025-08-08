/**
 * Defines the conversation flow for the FlexWork chatbot
 * This configuration allows for a dynamic and easily modifiable flow structure
 */

const flowConfig = {
  welcome: {
    id: "welcome",
    message: "Hello! Welcome to FlexWork. I'm Arth-AI, your friendly virtual assistant. Please select a role to proceed.",
    nextStep: "role",
    type: "message"
  },
  role: {
    id: "role",
    message: "Please select your role:",
    type: "options",
    options: [
      {
        text: "Freelancer",
        value: "freelancer",
        nextStep: "freelancer_category"
      },
      {
        text: "Employer",
        value: "employer",
        nextStep: "employer_service"
      },
      {
        text: "Student/Fresher/Upskill",
        value: "student",
        nextStep: "student_option"
      }
    ]
  },
  
  // Freelancer flow
  freelancer_category: {
    id: "freelancer_category",
    message: "Wonderful! Let's get you started on your freelancing journey. Please choose your freelance category:",
    type: "options",
    options: [
      {
        text: "Consultant",
        value: "consultant",
        nextStep: "freelancer_consultant_response"
      },
      {
        text: "Trainer",
        value: "trainer",
        nextStep: "freelancer_trainer_response"
      },
      {
        text: "Interview Panel",
        value: "panel",
        nextStep: "freelancer_panel_response"
      }
    ]
  },
  freelancer_consultant_response: {
    id: "freelancer_consultant_response",
    message: "We'd love to have you join our community of consultants! Kickstart your freelance journey with FlexWork by registering, updating your profile, and discovering opportunities that match your expertise. <a href='https://flex-work.in/auth/signup' target='_blank' class='flex-link'>Sign up</a> to get started!",
    type: "message",
    nextStep: "verify_selections"
  },
  freelancer_trainer_response: {
    id: "freelancer_trainer_response",
    message: "Your knowledge and expertise are valuable! Join FlexWork as a trainer, create your professional profile, and connect with clients seeking your skills. <a href='https://flex-work.in/auth/signup' target='_blank' class='flex-link'>Sign up</a> to begin your training journey!",
    type: "message",
    nextStep: "verify_selections"
  },
  freelancer_panel_response: {
    id: "freelancer_panel_response",
    message: "Your experience can help shape the future of hiring! Join our interview panel experts, build your professional profile, and access exclusive opportunities. <a href='https://flex-work.in/auth/signup' target='_blank' class='flex-link'>Sign up</a> to get started!",
    type: "message",
    nextStep: "verify_selections"
  },
  
  // Employer flow
  employer_service: {
    id: "employer_service",
    message: "Thank you for choosing FlexWork for your hiring needs! What service are you interested in?",
    type: "options",
    options: [
      {
        text: "Hire a Consultant",
        value: "consultant",
        nextStep: "employer_project_size_consultant"
      },
      {
        text: "Hire a Trainer",
        value: "trainer",
        nextStep: "employer_project_size_trainer"
      },
      {
        text: "Hire an Interview Panel",
        value: "panel",
        nextStep: "employer_project_size_panel"
      },
      {
        text: "Hire Multiple People",
        value: "Multi",
        nextStep: "employer_project_size_multi"
      }
    ]
  },
  // Common employer questions - Consultant path
  employer_project_size_consultant: {
    id: "employer_project_size_consultant",
    message: "What is the project size?",
    type: "options",
    options: [
      {
        text: "Small (<3 months)",
        value: "Small (<3 months)",
        nextStep: "employer_headcount_consultant"
      },
      {
        text: "Medium (3-6 months)",
        value: "Medium (3-6 months)",
        nextStep: "employer_headcount_consultant"
      },
      {
        text: "Large (6+ months)",
        value: "Large (6+ months)",
        nextStep: "employer_headcount_consultant"
      }
    ]
  },
  employer_headcount_consultant: {
    id: "employer_headcount_consultant",
    message: "How many professionals do you need?",
    type: "options",
    options: [
      {
        text: "Below 3",
        value: "Below 3",
        nextStep: "employer_work_mode_consultant"
      },
      {
        text: "Below 6",
        value: "Below 6",
        nextStep: "employer_work_mode_consultant"
      },
      {
        text: "More than 6",
        value: "More than 6",
        nextStep: "employer_work_mode_consultant"
      }
    ]
  },
  employer_work_mode_consultant: {
    id: "employer_work_mode_consultant",
    message: "What is your preferred work mode?",
    type: "options",
    options: [
      {
        text: "On-site",
        value: "On-site",
        nextStep: "employer_start_time_consultant"
      },
      {
        text: "Remote",
        value: "Remote",
        nextStep: "employer_start_time_consultant"
      },
      {
        text: "Hybrid",
        value: "Hybrid",
        nextStep: "employer_start_time_consultant"
      }
    ]
  },
  employer_start_time_consultant: {
    id: "employer_start_time_consultant",
    message: "When would you like the work to begin?",
    type: "options",
    options: [
      {
        text: "Immediate",
        value: "Immediate",
        nextStep: "skills"
      },
      {
        text: "Within 15 days",
        value: "Within 15 days",
        nextStep: "skills"
      },
      {
        text: "Within a month",
        value: "Within a month",
        nextStep: "skills"
      }
    ]
  },
  
  // Common employer questions - Trainer path
  employer_project_size_trainer: {
    id: "employer_project_size_trainer",
    message: "What is the project size?",
    type: "options",
    options: [
      {
        text: "Small (<3 months)",
        value: "Small (<3 months)",
        nextStep: "employer_headcount_trainer"
      },
      {
        text: "Medium (3-6 months)",
        value: "Medium (3-6 months)",
        nextStep: "employer_headcount_trainer"
      },
      {
        text: "Large (6+ months)",
        value: "Large (6+ months)",
        nextStep: "employer_headcount_trainer"
      }
    ]
  },
  employer_headcount_trainer: {
    id: "employer_headcount_trainer",
    message: "How many professionals do you need?",
    type: "options",
    options: [
      {
        text: "Below 3",
        value: "Below 3",
        nextStep: "employer_work_mode_trainer"
      },
      {
        text: "Below 6",
        value: "Below 6",
        nextStep: "employer_work_mode_trainer"
      },
      {
        text: "More than 6",
        value: "More than 6",
        nextStep: "employer_work_mode_trainer"
      }
    ]
  },
  employer_work_mode_trainer: {
    id: "employer_work_mode_trainer",
    message: "What is your preferred work mode?",
    type: "options",
    options: [
      {
        text: "On-site",
        value: "On-site",
        nextStep: "employer_start_time_trainer"
      },
      {
        text: "Remote",
        value: "Remote",
        nextStep: "employer_start_time_trainer"
      },
      {
        text: "Hybrid",
        value: "Hybrid",
        nextStep: "employer_start_time_trainer"
      }
    ]
  },
  employer_start_time_trainer: {
    id: "employer_start_time_trainer",
    message: "When would you like the work to begin?",
    type: "options",
    options: [
      {
        text: "Immediate",
        value: "Immediate",
        nextStep: "trainer_details"
      },
      {
        text: "Within 15 days",
        value: "Within 15 days",
        nextStep: "trainer_details"
      },
      {
        text: "Within a month",
        value: "Within a month",
        nextStep: "trainer_details"
      }
    ]
  },
  
  // Common employer questions - Panel path
  employer_project_size_panel: {
    id: "employer_project_size_panel",
    message: "What is the project size?",
    type: "options",
    options: [
      {
        text: "Small (<3 months)",
        value: "Small (<3 months)",
        nextStep: "employer_headcount_panel"
      },
      {
        text: "Medium (3-6 months)",
        value: "Medium (3-6 months)",
        nextStep: "employer_headcount_panel"
      },
      {
        text: "Large (6+ months)",
        value: "Large (6+ months)",
        nextStep: "employer_headcount_panel"
      }
    ]
  },
  employer_headcount_panel: {
    id: "employer_headcount_panel",
    message: "How many professionals do you need?",
    type: "options",
    options: [
      {
        text: "Below 3",
        value: "Below 3",
        nextStep: "employer_work_mode_panel"
      },
      {
        text: "Below 6",
        value: "Below 6",
        nextStep: "employer_work_mode_panel"
      },
      {
        text: "More than 6",
        value: "More than 6",
        nextStep: "employer_work_mode_panel"
      }
    ]
  },
  employer_work_mode_panel: {
    id: "employer_work_mode_panel",
    message: "What is your preferred work mode?",
    type: "options",
    options: [
      {
        text: "On-site",
        value: "On-site",
        nextStep: "employer_start_time_panel"
      },
      {
        text: "Remote",
        value: "Remote",
        nextStep: "employer_start_time_panel"
      },
      {
        text: "Hybrid",
        value: "Hybrid",
        nextStep: "employer_start_time_panel"
      }
    ]
  },
  employer_start_time_panel: {
    id: "employer_start_time_panel",
    message: "When would you like the work to begin?",
    type: "options",
    options: [
      {
        text: "Immediate",
        value: "Immediate",
        nextStep: "panel_details"
      },
      {
        text: "Within 15 days",
        value: "Within 15 days",
        nextStep: "panel_details"
      },
      {
        text: "Within a month",
        value: "Within a month",
        nextStep: "panel_details"
      }
    ]
  },
  
  // Common employer questions - Multiple hire path
  employer_project_size_multi: {
    id: "employer_project_size_multi",
    message: "What is the project size?",
    type: "options",
    options: [
      {
        text: "Small (<3 months)",
        value: "Small (<3 months)",
        nextStep: "employer_headcount_multi"
      },
      {
        text: "Medium (3-6 months)",
        value: "Medium (3-6 months)",
        nextStep: "employer_headcount_multi"
      },
      {
        text: "Large (6+ months)",
        value: "Large (6+ months)",
        nextStep: "employer_headcount_multi"
      }
    ]
  },
  employer_headcount_multi: {
    id: "employer_headcount_multi",
    message: "How many professionals do you need?",
    type: "options",
    options: [
      {
        text: "Below 3",
        value: "Below 3",
        nextStep: "employer_work_mode_multi"
      },
      {
        text: "Below 6",
        value: "Below 6",
        nextStep: "employer_work_mode_multi"
      },
      {
        text: "More than 6",
        value: "More than 6",
        nextStep: "employer_work_mode_multi"
      }
    ]
  },
  employer_work_mode_multi: {
    id: "employer_work_mode_multi",
    message: "What is your preferred work mode?",
    type: "options",
    options: [
      {
        text: "On-site",
        value: "On-site",
        nextStep: "employer_start_time_multi"
      },
      {
        text: "Remote",
        value: "Remote",
        nextStep: "employer_start_time_multi"
      },
      {
        text: "Hybrid",
        value: "Hybrid",
        nextStep: "employer_start_time_multi"
      }
    ]
  },
  employer_start_time_multi: {
    id: "employer_start_time_multi",
    message: "When would you like the work to begin?",
    type: "options",
    options: [
      {
        text: "Immediate",
        value: "Immediate",
        nextStep: "multiple_hire_details"
      },
      {
        text: "Within 15 days",
        value: "Within 15 days",
        nextStep: "multiple_hire_details"
      },
      {
        text: "Within a month",
        value: "Within a month",
        nextStep: "multiple_hire_details"
      }
    ]
  },
  // Specific inputs based on service type
  skills: {
    id: "skills",
    message: "Please enter the required skills for the consultant (e.g., Full Stack Developer, UI/UX Designer):",
    type: "input",
    validation: { type: "text", minLength: 3 },
    nextStep: "employer_thanks"
  },
  trainer_details: {
    id: "trainer_details",
    message: "Please provide details about the training requirements:\n• Role/Skill to be taught\n• Expected training duration\n• Any specific expertise needed",
    type: "input",
    inputType: "textarea",
    nextStep: "employer_thanks"
  },
  panel_details: {
    id: "panel_details",
    message: "Please share your interview panel requirements:\n• Skills/Program to be assessed\n• Approximate number of interviews per day/month\n• Any specific experience needed from interviewers",
    type: "input",
    inputType: "textarea",
    nextStep: "employer_thanks"
  },
  multiple_hire_details: {
    id: "multiple_hire_details",
    message: "Please provide details about your multiple hiring needs:\n• Types of roles needed\n• Required skills for each role\n• Any other specific requirements",
    type: "input",
    inputType: "textarea",
    nextStep: "employer_thanks"
  },
  
  employer_thanks: {
    id: "employer_thanks",
    message: "Thank you for sharing these details! Our dedicated FlexWork team will contact you shortly to discuss your requirements further and provide the perfect match for your needs.",
    type: "message",
    nextStep: "verify_selections"
  },
  
  // Student flow
  student_option: {
    id: "student_option",
    message: "We're delighted to help with your career growth! What are you looking for?",
    type: "options",
    options: [
      {
        text: "Training Programs",
        value: "training",
        nextStep: "student_training"
      },
      {
        text: "Internship Opportunities",
        value: "internship",
        nextStep: "student_internship"
      },
      {
        text: "Project Work",
        value: "project",
        nextStep: "student_project"
      },
      {
        text: "Upskilling Courses",
        value: "upskilling",
        nextStep: "student_upskilling"
      }
    ]
  },
  student_training: {
    id: "student_training",
    message: "Excellent choice! Quality training is key to career success. Please tell me which skills or courses you're interested in (e.g., AI, Digital Marketing, Data Science):",
    type: "input",
    inputType: "text",
    nextStep: "student_thanks"
  },
  student_internship: {
    id: "student_internship",
    message: "Internships are a wonderful way to gain practical experience! Please share your preferred industry or role (e.g., Software Development, Marketing, Data Analytics):",
    type: "input",
    inputType: "text",
    nextStep: "student_thanks"
  },
  student_project: {
    id: "student_project",
    message: "Project work provides valuable hands-on experience! Please describe your area of interest or the type of project you're looking for:",
    type: "input",
    inputType: "text",
    nextStep: "student_thanks"
  },
  student_upskilling: {
    id: "student_upskilling",
    message: "Continuous learning is the path to growth! Please share which skills or certifications you're interested in pursuing (e.g., Cloud Computing, Cybersecurity, Management):",
    type: "input",
    inputType: "text",
    nextStep: "student_thanks"
  },
  student_thanks: {
    id: "student_thanks",
    message: "Thank you for sharing your interests! We'll help connect you with the right resources and opportunities to support your career journey.",
    type: "message",
    nextStep: "verify_selections"
  },

  // Freelancer flow
  freelancer_option: {
    id: "freelancer_option",
    message: "Welcome, freelancer! Please tell us about your primary skill or area of expertise:",
    type: "input",
    inputType: "text",
    nextStep: "freelancer_experience"
  },
  freelancer_experience: {
    id: "freelancer_experience",
    message: "How many years of professional experience do you have?",
    type: "input",
    inputType: "text",
    nextStep: "freelancer_availability"
  },
  freelancer_availability: {
    id: "freelancer_availability",
    message: "What is your current availability (e.g., part-time, full-time, project-based)?",
    type: "input",
    inputType: "text",
    nextStep: "verify_selections"
  },

  // Universal contact info step

  // Verification step before closing
  verify_selections: {
    id: "verify_selections",
    message: "Please review your selections before we proceed. Is everything correct?",
    type: "options",
    options: [
      {
        text: "Yes, submit my information",
        value: "yes",
        nextStep: "submit_to_database"
      },
      {
        text: "No, start over",
        value: "no",
        nextStep: "welcome"
      }
    ]
  },

  // Step to handle submission to database
  submit_to_database: {
    id: "submit_to_database",
    message:'',
    type: "message",
    storeUserData: true,
    nextStep: "closing"
  },

  // Common closing flow
  closing: {
    id: "closing",
    message: "Thank you for connecting with FlexWork! Is there anything else I can help you with today?",
    type: "message",
    nextStep: "open_chat"
  },
  
  open_chat: {
    id: "open_chat",
    type: "open_chat",
    // Exit commands are handled directly in ChatContext.js
  },

  // Add a new step for conversation exit handling
  conversation_exit: {
    id: "conversation_exit",
    message: "Thank you for using FlexWork! Your information has been saved. Have a great day!",
    type: "final", // Changed from 'message' to 'final' to indicate no further input
    // No options provided - conversation is completely ended
    disableInput: true // Explicitly disable input
   }

};

export default flowConfig;