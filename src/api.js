// src/api.js
import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: 'https://localhost:7013/api/', // Replace with your API's base URL
  timeout: 10000, // Optional timeout for requests
  headers: {
    'Content-Type': 'application/json',
    // Add other common headers here if needed
  },
  httpsAgent: new (require("https").Agent)({
    rejectUnauthorized: false
  })
});

export default api;