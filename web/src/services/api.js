import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const encryptData = async (key, data) => {
  const response = await api.post('/api/v1/encrypt', { key, data });
  return response.data;
};

export const decryptData = async (key, data) => {
  const response = await api.post('/api/v1/decrypt', { key, data });
  return response.data;
};

export const getLogs = async (size = 10, offset = 0) => {
  const response = await api.get('/api/v1/logs', {
    params: { size, offset },
  });
  return response.data;
};

export const generateKeys = async () => {
  const response = await api.post('/api/v1/generate-keys');
  return response.data;
};

export default api;