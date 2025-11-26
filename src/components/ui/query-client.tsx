import React from 'react';

// Mock implementation of QueryClientProvider to avoid hooks issues
export const QueryClientProvider = ({ children }: { children: React.ReactNode; client?: any }) => {
  return <>{children}</>;
};

// Mock implementation of QueryClient
export class QueryClient {
  constructor(options?: any) {}
}

// Mock implementation of useQuery
export const useQuery = (options: any) => {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

// Mock implementation of useMutation
export const useMutation = (options: any) => {
  return {
    mutate: () => {},
    isLoading: false,
    error: null,
  };
};

export default QueryClientProvider;