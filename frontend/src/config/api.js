
const API_BASE_URL = 
  process.env.REACT_APP_API_BASE_URL ||
  `https://${window.location.hostname.replace("3000", "8000")}`;

export default API_BASE_URL;
