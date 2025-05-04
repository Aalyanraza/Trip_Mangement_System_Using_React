

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true, // ✅ Important for sending cookies/auth
});

export default API;
