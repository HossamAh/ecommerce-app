import { configureStore, combineReducers } from '@reduxjs/toolkit';
// 1. Import the necessary functions and storage engine
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // This defaults to localStorage

import userSlice from './features/UserSlice';
import ProductSlice from './features/ProductsSlice';
import cartSlice from './features/CartSlice';

// 2. Define persistence config for the cart
const cartPersistConfig = {
  key: 'cart', // Key for the storage ('cart')
  storage,     // Storage engine (localStorage)
  // We only want to persist these specific parts of the cart state.
  // We do NOT want to persist the loading states.
  whitelist: ['cartID', 'cartItems', 'cartTotalPrice'],
};

// 3. Create a persisted version of the cart reducer
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);

// Create the root reducer with a reset action
const appReducer = combineReducers({
  user: userSlice,
  products: ProductSlice,
  cart: persistedCartReducer, // Use the persisted reducer here
});

// Root reducer with reset functionality
const rootReducer = (state, action) => {
  // When logout action is dispatched, reset all state
  if (action.type === 'RESET_APP_STATE') {
    // Clear persisted state
    storage.removeItem('persist:cart');
    
    // Return initial state for all reducers
    return appReducer(undefined, action);
  }
  
  return appReducer(state, action);
};

// 4. Configure the store with the root reducer
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these actions thrown by redux-persist to avoid warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Create the persistor object
export const persistor = persistStore(store);

// 6. Export reset action creator
export const resetAppState = () => ({ type: 'RESET_APP_STATE' });

export default store;


