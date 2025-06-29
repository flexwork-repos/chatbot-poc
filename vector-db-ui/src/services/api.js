import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Vector DB API service
export const vectorDbApi = {
  // Get vector database status
  getStatus: async () => {
    try {
      const response = await api.get('/api/vector-db/status');
      console.log('Calling API:', api.defaults.baseURL + '/api/vector-db/status');
      return response.data;
    } catch (error) {
      console.error('Error getting vector DB status:', error);
      throw error;
    }
  },

  // Upload document to vector database
  uploadDocument: async (file, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata as JSON string
      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await api.post('/api/vector-db/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Search documents in vector database
  searchDocuments: async (query, n_results = 5, metadata_filter = null, relevancy_threshold = 0.0) => {
    try {
      const response = await api.post('/api/vector-db/search', {
        query,
        n_results,
        metadata_filter,
        relevancy_threshold,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  },

  // List all documents in vector database
  listDocuments: async () => {
    try {
      const response = await api.get('/api/vector-db/documents');
      return response.data;
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  },

  // Delete document from vector database
  deleteDocument: async (filename) => {
    try {
      const response = await api.delete(`/api/vector-db/documents/${encodeURIComponent(filename)}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Reset vector database
  resetDatabase: async () => {
    try {
      const response = await api.post('/api/vector-db/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting vector database:', error);
      throw error;
    }
  },

  // Send chat message with optional RAG and LLM parameters
  sendChatMessage: async (message, use_rag = true, model_name = "gpt-4.1-nano", temperature = 0.7, max_tokens = 1024) => {
    try {
      // Format messages as an array with user role as expected by backend
      const response = await api.post('/api/groq/chat', {
        messages: [
          { role: 'user', content: message }
        ],
        use_rag,
        model_name,
        temperature,
        max_tokens
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },
};

export default api;