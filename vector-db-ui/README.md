# Vector Database Management UI

A modern React-based user interface for managing the ChromaDB vector database integrated with the RAG-enabled chat system.

## Features

- **Dashboard**: View vector database status, document counts, and document type distribution
- **Document Upload**: Upload documents with custom metadata to the vector database
- **Document List**: Browse, search, and delete documents in the vector database
- **Vector Search**: Perform semantic searches with metadata filtering
- **Chat**: Interact with the RAG-enabled chat system
- **Settings**: Configure RAG parameters and reset the vector database

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Backend API running (Flask server with ChromaDB integration)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with the following content (adjust as needed):

```
REACT_APP_API_URL=http://localhost:5000
```

## Development

Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

Build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

- `src/components/`: Reusable UI components
- `src/pages/`: Page components for each route
- `src/services/`: API service modules
- `src/App.js`: Main application component with routing
- `src/index.js`: Application entry point

## Technologies Used

- React 18
- Material-UI v5
- React Router v6
- Axios for API requests
- React Dropzone for file uploads
- Chart.js for data visualization
