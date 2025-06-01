// config.js
// this lives in the web root and must be loaded before any other script
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

window.APP_CONFIG = {
  BACKEND_URL
};
