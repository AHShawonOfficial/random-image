import { useState, useEffect } from 'react';

export default function useDebounceState<T>(value: T, delay = 500) {
   const [debouncedValue, setDebouncedValue] = useState(value);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedValue(value);
      }, delay);

      return () => {
         clearTimeout(timer);
      };
   }, [value, delay]);

   return debouncedValue;
}
