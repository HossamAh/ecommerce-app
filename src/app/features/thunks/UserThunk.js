'use client';
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import nextConfig from '../../../../next.config.mjs';
import {ClearCart} from '../CartSlice';
import { getCart,addToCart } from "../../features/thunks/CartThunk";
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

export const getUser = createAsyncThunk("user/getUser", async (accessToken) => {
    try {
        const response = await api.get('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
});


export const UserLogin = createAsyncThunk(
    "user/login",
    async (credentials, { dispatch,getState }) => {
        try{

          const userData = await axios.post(
            nextConfig.env.API_URL + "/api/auth/login",
            credentials,
            { withCredentials: true }
        );
        //get the persisted data from the guest to attach it to the user
        // 2. AFTER successful login, get the persisted guest cart from the state
        const state = getState();
        const guestCartItems = state.cart.cartItems;
        console.log("guest cart items:",guestCartItems);

        // 3. IMPORTANT: Clear the persisted guest cart now that we're logged in.
        // This prevents it from being rehydrated on next page load for a logged-in user.
        dispatch({ type: 'PURGE', key: 'root'}); // Or use persistor.purge()
        // persistor.purge()
        
        // 4. Fetch the user's saved cart from the database to the redux store
        await dispatch(getCart(userData.data.accessToken));

        console.log("after loading the auth user cart");
        console.log("auth user cart:",getState().cart);
        // After successful login, dispatch getUser
        await dispatch(getUser(userData.data.accessToken));
        console.log("user data:",getState().user.user);
        
        // 5. If the guest had items, merge them into the user's cart on the server
        if (guestCartItems.length > 0) {
          // This loop sends each guest cart item to the server to be added/merged
          console.log("adding the guest items to the auth cart");
          for (const item of guestCartItems) {
            // Your addToCart thunk should now use the user's auth token
            // You might need to modify it to accept a token in the payload
            try {
              await dispatch(addToCart({
                accessToken:userData.data.accessToken,
                cartId:getState().user.user.Cart.id,
                variantId: item.ProductVariantId, 
                quantity: item.quantity,
              })).unwrap(); // .unwrap() handles the Promise from the thunk
            } catch (error) {
              console.error("Failed to merge item:", item, error);
            }
          }
          // After merging all guest items, re-fetch the final merged cart
          await dispatch(getCart(userData.data.accessToken));
          // const mergedCart = getState().cart;
          // dispatch(replaceCart(mergedCart));
          console.log("cart after merge:",state.cart);
        }


        // After successful login, dispatch getUser
        return userData.data;
      }
      catch(error){
        console.log(error);
        return null;
      }
        
    }
);

export const UserLogout = createAsyncThunk("user/UserLogout",async (accessToken,{dispatch})=>{
  try{
    const response = await axios.get(nextConfig.env.API_URL + "/api/auth/logout", {headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
          });
    // First clear the cart (immediate UI update)
    dispatch(ClearCart());
    
    // Then reset the entire app state including persisted storage
    // Import resetAppState dynamically to avoid circular dependency
    const store = await import('../../store');
    dispatch(store.resetAppState());
    
    return response.data;
  }
  catch(error){
    throw error;
  }
});