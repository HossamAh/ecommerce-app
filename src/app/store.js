import { configureStore } from '@reduxjs/toolkit';
import userSlice from './features/UserSlice';
import ProductSlice from './features/ProductsSlice';
import cartSlice from './features/CartSlice';
const store = configureStore({
    reducer:{
        user: userSlice,
        products: ProductSlice,
        cart: cartSlice,
    },
});
export default store;