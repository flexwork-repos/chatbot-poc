-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS flexwork_chatbot;

USE flexwork_chatbot;

-- Create table for storing user selections with structured fields
CREATE TABLE IF NOT EXISTS user_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL UNIQUE,
  user_type ENUM('Employer', 'Student/Fresher/Upskill', 'Freelancer') NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  -- Common fields across all user types
  role VARCHAR(100),
  work_mode VARCHAR(50),
  -- Employer specific fields
  skills VARCHAR(255),
  employer_headcount_consultant VARCHAR(50),
  employer_project_size_consultant VARCHAR(100),
  employer_service VARCHAR(100),
  employer_start_time_consultant VARCHAR(50),
  employer_work_mode_consultant VARCHAR(50),
  -- Student and freelancer specific fields
  student_option VARCHAR(100),
  student_training VARCHAR(255),
  freelancer_category VARCHAR(100),
  freelancer_availability VARCHAR(100),
  -- Chat transcript and other data
  chat_transcript TEXT,
  -- Status tracking
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (session_id),
  INDEX (user_type),
  INDEX (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
