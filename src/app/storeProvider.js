'use client'
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store'; // Import both store and persistor

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      {/* 2. Delay app rendering until persisted state is loaded */}
      <PersistGate loading={null} persistor={persistor}>
      {children}
      </PersistGate>
    </Provider>
  );
}