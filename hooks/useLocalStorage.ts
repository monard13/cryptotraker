import { useState, Dispatch, SetStateAction } from 'react';

// This is a more robust implementation that uses the functional update form of useState's setter.
// This ensures that the function always has access to the most recent state,
// preventing stale state bugs that were causing the delete functionality to fail.
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // We wrap the `setStoredValue` in our own setter function.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    // By using the updater function form of the state setter, we get the `prevState`
    // which is guaranteed by React to be the most current.
    setStoredValue(prevState => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(prevState) : value;
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Return the new value to update the state
            return valueToStore;
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
            // In case of error, we return the previous state to avoid breaking the app
            return prevState;
        }
    });
  };

  return [storedValue, setValue];
};