import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import nextConfig from '../../../../next.config.mjs';

// Create a completely new thunk with a different name
export const loadProducts = createAsyncThunk(
  "products/loadProductsList",
  async (page=1) => {
    let products = await axios.get(
      nextConfig.env.API_URL+'/api/products?page='+page, 
      {withCredentials:true}
    );
    return products.data;
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