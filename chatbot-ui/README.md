# Flexwork Chatbot Application

A comprehensive AI chatbot application with RAG (Retrieval-Augmented Generation) capabilities, vector database search, and user information management.

## System Architecture

The Flexwork Chatbot application consists of three main components:

1. **Main Chatbot Frontend**: A React application that provides the conversational interface for users
2. **Vector Database UI**: A separate React application for managing and searching the vector database
3. **Backend API**: A Flask-based API server that handles chat completions, vector database operations, and user data management

## Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MySQL (v8.0+)
- ChromaDB

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. Install the required packages:
   ```
   pip install -r requirement.txt
   ```

4. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```

5. Update the `.env` file with your configuration:
   - Set your OpenAI API key
   - Configure your MySQL database connection details
   - Set other environment variables as needed

6. Create the MySQL database and tables:
   ```
   mysql -u root -p
   CREATE DATABASE flexwork_chatbot;
   exit
   
   # Import the database schema
   mysql -u root -p flexwork_chatbot < backend/database.sql
   ```
   
   Alternatively, the application will automatically create the required tables on startup based on the schema in `database.sql`.

7. Start the backend server:
   ```
   python rag_backend.py
   ```

### Main Chatbot Frontend Setup

1. Navigate to the project root directory:
   ```
   cd ..  # If you're in the backend directory
   ```

2. Install the required packages:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Start the frontend application:
   ```
   npm start
   ```

5. The application will be available at http://localhost:3000

### Vector Database UI Setup

1. Navigate to the vector-db-ui directory:
   ```
   cd frontend/vector-db-ui
   ```

2. Install the required packages:
   ```
   npm install
   ```

3. Create a `.env` file in the vector-db-ui directory:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Start the vector database UI:
   ```
   npm start
   ```

5. The vector database UI will be available at http://localhost:3001

## Features

### Chatbot

- Conversational AI interface using OpenAI models
- Configurable LLM parameters (model, temperature, max tokens)
- User information collection and storage
- Guided conversation flow based on configuration

### Vector Database

- Document upload and processing
- Vector embedding and storage using ChromaDB
- Semantic search with relevancy filtering
- Metadata filtering capabilities

### User Data Management

- Collection and storage of user contact information
- Database storage for user interactions
- Data retrieval for analytics and follow-up

## API Endpoints

### Chat Endpoints

- `POST /api/chat`: Send a message to the chatbot and get a response
- `POST /api/user-info`: Save user information to the database

### Vector Database Endpoints

- `POST /api/vector-db/upload`: Upload documents to the vector database
- `POST /api/vector-db/search`: Search the vector database with query and filters
- `GET /api/vector-db/status`: Get the status of the vector database
- `GET /api/vector-db/documents`: List all documents in the vector database
- `DELETE /api/vector-db/documents`: Delete documents from the vector database

## Troubleshooting

### Database Connection Issues

If you're experiencing issues with database connections:

1. Ensure MySQL is running:
   ```
   mysql --version
   ```

2. Verify database credentials in the `.env` file
3. Check if the database exists:
   ```
   mysql -u root -p -e "SHOW DATABASES LIKE 'flexwork_chatbot';"
   ```

4. Verify the user_information table exists:
   ```
   mysql -u root -p -e "USE flexwork_chatbot; SHOW TABLES LIKE 'user_information';"
   ```

### API Connection Issues

1. Ensure the backend server is running
2. Check the CORS configuration in the backend
3. Verify the API URL in the frontend `.env` files

## License

This project is licensed under the MIT License - see the LICENSE file for details.
