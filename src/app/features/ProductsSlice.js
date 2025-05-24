import { createSlice } from "@reduxjs/toolkit";
import { loadProducts, getProduct } from "./thunks/ProductThunks";

const ProductSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    currentPage: 1,
    totalPages: 1,
    productsLoadingState: '',
    currentProduct: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // Handle loadProducts thunk
    builder
      .addCase(loadProducts.pending, (state) => {
        state.productsLoadingState = "loading";
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.productsLoadingState = "completed";
        state.products = action.payload.products;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(loadProducts.rejected, (state) => {
        state.productsLoadingState = "failed";
      });

    // Handle getProduct thunk
    builder
      .addCase(getProduct.pending, (state) => {
        state.productsLoadingState = "loading";
        state.currentProduct = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.productsLoadingState = "completed";
        console.log("Product data received:", action.payload);
        
        // Store the current product directly
        state.currentProduct = action.payload;
        
        // Also add to products array if not already there
        if (action.payload) {
          const product = action.payload;
          const exists = state.products.some(p => p.id === product.id);
          if (!exists) {
            state.products.push(product);
          }
        }
      })
      .addCase(getProduct.rejected, (state) => {
        state.productsLoadingState = "failed";
        state.currentProduct = null;
      });
  }
});

export default ProductSlice.reducer;
