// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-base-url.com', // 🔁 Replace with your real API base URL
  headers: {
    Authorization: 'Bearer 687358248d68d83e8b2fe122',
  },
});

export default api;

//TODO need to check 
