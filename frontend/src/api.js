import axios from 'axios';

const instance = axios.create({
  baseURL: "https://backend-reboot-l2g.onrender.com/",
  // baseURL: "http://localhost:5001/",
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default instance;