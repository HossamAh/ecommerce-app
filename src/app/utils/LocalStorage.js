"use client";
import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
  // State to handle mounted check
  const [mounted, setMounted] = useState(false);
  
  // Initialize state without accessing localStorage
  const [storedValue, setStoredValue] = useState(initialValue);

  // On mount, check localStorage and update state
  useEffect(() => {
    setMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Try parsing as JSON, if fails use raw value
        try {
          setStoredValue(JSON.parse(item));
        } catch {
          setStoredValue(item);
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, [key]);

  // Update localStorage when value changes
  useEffect(() => {
    if (!mounted) return;
    
    try {
      if (storedValue !== '') {
        // Store raw value if it's a string, otherwise stringify
        const valueToStore = typeof storedValue === 'string' 
          ? storedValue 
          : JSON.stringify(storedValue);
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue, mounted]);

  return [storedValue, setStoredValue];
}