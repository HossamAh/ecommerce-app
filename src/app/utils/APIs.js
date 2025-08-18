import axios from 'axios';
import nextConfig from '../../../next.config.mjs';

// Create axios instance with default config
const api = axios.create({
  baseURL: nextConfig.env.API_URL,
  withCredentials: true
});

// Add interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get new access token
        const refreshResponse = await axios.get(
          `${nextConfig.env.API_URL}/api/auth/refresh`,
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.accessToken;
        
        // Update localStorage
        localStorage.setItem('accessToken', newAccessToken);
        
        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

exports.getProductVariantAttributes = async ()=>{
    try{
      const attributes = await api.get(`${nextConfig.env.API_URL}/api/productAttributes/`);
      return attributes;
    }
    catch(error){
        console.log(error);
    }

}

exports.getProductVariantAttributesValueByAttribute = async (attributeId)=>{
  try{
    const attributeValues = await api.get(`${nextConfig.env.API_URL}/api/productAttributeValues/attribute/${attributeId}`)
    return attributeValues;
  }
  catch(error){
    console.log(error);
  }
}