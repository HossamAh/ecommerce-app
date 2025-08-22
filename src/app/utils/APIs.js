import axios from 'axios';
import nextConfig from '../../../next.config.mjs';
import { deleteProduct } from './../features/thunks/ProductThunks';

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

exports.getProductVariantAttributes = async (page,pageSize) => {
    try {
        const attributes = await api.get(`${nextConfig.env.API_URL}/api/productAttributes/?page=${page}&pageSize=${pageSize}`);
        return attributes;
    } catch (error) {
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

exports.createProductVariantAttributes = async({accessToken,data})=>{
  console.log(data);
  try{
    const result = await api.post(`${nextConfig.env.API_URL}/api/productAttributes/`,data,
      {headers: {
            'Authorization': `Bearer ${accessToken}`
        }})

        return result;
  }
  catch(error){
    console.log(error);
  }
}



exports.updateProductVariantAttributes = async({accessToken,attributeId,data})=>{
  try{
    const result = await api.put(`${nextConfig.env.API_URL}/api/productAttributes/${attributeId}`,data,
      {headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        }})
        return result;
  }
  catch(error){
    console.log(error);
  }
}

exports.deleteProductVariantAttributes = async({accessToken,attributeId})=>{
  try{
    const result = await api.delete(`${nextConfig.env.API_URL}/api/productAttributes/${attributeId}`,
      {headers: {
            'Authorization': `Bearer ${accessToken}`
        }})
      return result;
  }
  catch(error){
    console.log(error);
  }
}


exports.createProductVariantAttributesValue = async({accessToken,data})=>{
  console.log(data);
  try{
    const result = await api.post(`${nextConfig.env.API_URL}/api/productAttributeValues/`,data,
      {headers: {
            'Authorization': `Bearer ${accessToken}`
        }})
        return result;
  }
  catch(error){
    console.log(error);
  }
}

exports.getProductVariantAttributesValue = async(page,pageSize)=>{

  try{
    const result = await api.get(`${nextConfig.env.API_URL}/api/productAttributeValues/?page=${page}&pageSize=${pageSize}`)
    return result;
  }
  catch(error){
    console.log(error);
  }
}

exports.updateProductVariantAttributesValue = async({accessToken,id,data})=>{
  try{
    const result = await api.put(`${nextConfig.env.API_URL}/api/productAttributeValues/${id}`,data,
      {headers: {
            'Authorization': `Bearer ${accessToken}`
        }})
        return result;
  }
  catch(error){
    console.log(error);
  }
}

exports.deleteProductVariantAttributesValue = async({accessToken,id})=>{
  try{
    const result = await api.delete(`${nextConfig.env.API_URL}/api/productAttributeValues/${id}`,
      {headers: {
            'Authorization': `Bearer ${accessToken}`
        }})
      return result;
  }
  catch(error){
    console.log(error);
  }
}
