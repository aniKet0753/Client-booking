import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // baseURL: "http://localhost:5001/",
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default instance; 