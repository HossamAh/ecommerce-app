import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import nextConfig from '../../../../next.config.mjs';

export const loadProducts = createAsyncThunk(
  "products/loadProductsList",
  async ({ page = 1, pageSize = 10 }) => {
    console.log("inside load products thunk", page, pageSize);
    const response = await axios.get(
      `${nextConfig.env.API_URL}/api/products?page=${page}&pageSize=${pageSize}`, 
      { withCredentials: true }
    );
    return response.data;
  }
);

// Create a completely new thunk with a different name
export const getProduct = createAsyncThunk(
  "products/getProductById", 
  async (productID) => {
    let products = await axios.get(
      nextConfig.env.API_URL+`/api/products/${productID}`, 
      {withCredentials:true}
    );
    return products.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productID,accessToken) => {
    let products = await axios.delete(
      nextConfig.env.API_URL+`/api/products/${productID}`, 
      {
        headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
        ,withCredentials:true}
    );
    return products.data;
  }
);