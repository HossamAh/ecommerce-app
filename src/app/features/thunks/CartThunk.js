import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import nextConfig from '../../../../next.config.mjs';


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

export const getCart = createAsyncThunk("cart/getCart",async (accessToken)=>{
  
    let response = await api.get(nextConfig.env.API_URL+"/api/carts/user",{
      headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
    });
    return response.data;
  });



  export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({accessToken,cartId, variantId, quantity}) => {
    
    console.log("inside add to cart thunk", cartId, variantId, quantity);
    let response = await api.post(
      nextConfig.env.API_URL+"/api/cartItems",{cartId, variantId, quantity},
      {headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
      }
    );
    return response.data;
  }
);

  export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({accessToken,cartId, cartItemId, quantity}) => {
    let response = await api.put(
      nextConfig.env.API_URL+"/api/cartItems/"+`${cartItemId}`,{cartId, quantity},
      {headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
      }
    );
    return response.data;
  }
);



export const removeFromCart = createAsyncThunk("cart/removeFromCart", async ({accessToken,cartID, cartItemID}) => {
  
  
  let response = await api.delete(nextConfig.env.API_URL+"/api/cartItems", {
    data: {
            CartId: cartID,
            cartItemId: cartItemID
        },
        headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
    });
    return response.data;
});