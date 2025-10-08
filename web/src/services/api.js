import axios from 'axios';

// Use relative URL in production (Docker), absolute URL in development
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Helper function to handle API errors consistently
const handleApiError = (error, operationName = 'operation') => {
  // Network error - server is down or unreachable
  // Axios sets error.code to 'ERR_NETWORK' for network failures
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    // Check if it's specifically a connection refused error
    if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      throw {
        isConnectionRefused: true,
        message: 'Unable to connect to the server. The backend is not running.\n\n' +
                 'Please start the server:\n' +
                 '1. Open Docker Desktop\n' +
                 '2. Run: docker compose up\n' +
                 '3. Wait for all services to start',
        originalError: error
      };
    }
    
    // General network error
    throw {
      isNetworkError: true,
      message: 'Unable to connect to the server. Please ensure:\n' +
               '• The backend service is running (check Docker Desktop)\n' +
               '• The server is running on http://localhost:8000\n' +
               '• Your firewall isn\'t blocking the connection',
      originalError: error
    };
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    throw {
      isTimeoutError: true,
      message: 'Server request timed out. The server may be slow or unresponsive.\n' +
               'Please try again or check if the server is overloaded.',
      originalError: error
    };
  }
  
  // Server responded with an error (4xx, 5xx)
  if (error.response) {
    throw error; // Let the calling code handle it
  }
  
  // Unknown error
  throw {
    isUnknownError: true,
    message: `An unexpected error occurred during ${operationName}.\n` +
             'Please try again or contact support if the issue persists.',
    originalError: error
  };
};

export const encryptData = async (key, data) => {
  try {
    const response = await api.post('/api/v1/encrypt', { key, data });
    return response.data;
  } catch (error) {
    handleApiError(error, 'encryption');
  }
};

export const decryptData = async (key, data) => {
  try {
    const response = await api.post('/api/v1/decrypt', { key, data });
    return response.data;
  } catch (error) {
    handleApiError(error, 'decryption');
  }
};

export const getLogs = async (size = 10, offset = 0) => {
  try {
    const response = await api.get('/api/v1/logs', {
      params: { size, offset },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching logs');
  }
};

export default api;