/** @type {import('next').NextConfig} */
const nextConfig = {
    // next.config.js
    env: {
      API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://todo-list-backend-production-0aa9.up.railway.app' 
        : 'http://localhost:7000'
    }
};

export default nextConfig;
