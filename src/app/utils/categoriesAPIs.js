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

export async function loadCategories({accessToken,page=1,pageSize=12}){
    console.log(accessToken,page,pageSize);
    let categories = await api.get(
        `${nextConfig.env.API_URL}/api/categories?page=${page}&pageSize=${pageSize}`,
        {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }}
    );
    return categories.data;
};

export async function DeleteCategory({accessToken,id}){
    let results = await api.delete(
        `${nextConfig.env.API_URL}/api/categories/${id}`,
        {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }}
    
    );
    return results.data;
};

export async function CreateCategory({accessToken,data}){
    console.log(data);
    let results = await api.post(
        `${nextConfig.env.API_URL}/api/categories`,
        data,
        {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        }}
    );
    return results.data;
};

export async function UpdateCategory({accessToken,id,data}){
    console.log(data);
    let results = await api.put(
        `${nextConfig.env.API_URL}/api/categories/${id}`,
        data,
        {
      headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        }}
    );
    return results.data;
};            