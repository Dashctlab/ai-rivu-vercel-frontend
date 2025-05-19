// config.js
const config = {
  backendURL: typeof window !== 'undefined' 
    ? window.ENV?.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ai-rivu-vercel-render-backend.onrender.com'
    : process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ai-rivu-vercel-render-backend.onrender.com'
};

export default config;
