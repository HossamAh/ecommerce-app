import { createSelector } from "@reduxjs/toolkit";

export const getProducts = createSelector(
  [(state) => state?.products?.products || []],
  (products) => products
);
export const getLoadingState = createSelector(
  [(state) => state?.products?.productsLoadingState || 'pending'],
  (productsLoadingState) => productsLoadingState
);

export const getCurrentProduct = createSelector(
  [(state) => state?.products?.currentProduct || null],
  (currentProduct) => currentProduct
);


export const getCurrentPage = createSelector(
  [(state) => state?.products?.currentPage || 1],
  (currentPage) => currentPage
);

export const getTotalPages = createSelector(
  [(state) => state?.products?.totalPages || 1],
  (totalPages) => totalPages
);

export const SelectUser = createSelector(
  [(state) => state?.user || {}],
  (user) => user
);
export const SelectCart = createSelector(
  [(state) => state?.cart || {}],
  (cart) => cart
);


