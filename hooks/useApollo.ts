import { useMemo } from 'react';
import { initializeApollo } from 'src/lib/apollo';

export function useApollo(initialState = {}) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
