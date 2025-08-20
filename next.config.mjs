/** @type {import('next').NextConfig} */
const nextConfig = {
    // next.config.js
    env: {
      API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://ecommerce-backend-2-production.up.railway.app' 
        : 'http://localhost:7000'
        
    }
};

export default nextConfig;
