import { useState, useCallback } from 'react';
import { AppError, LoadingState } from '../types';
import { ErrorHandler } from '../utils/errorHandler';

export interface AsyncOperationResult<T> extends LoadingState {
  data: T | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T>(
  operation: (...args: any[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: AppError) => void
): AsyncOperationResult<T> {
  const [state, setState] = useState<LoadingState & { data: T | null }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await operation(...args);
      setState(prev => ({ ...prev, isLoading: false, data: result }));
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const appError = error instanceof Error 
        ? ErrorHandler.createError('OPERATION_FAILED', error.message)
        : ErrorHandler.createError('UNKNOWN_ERROR', 'An unknown error occurred');
      
      setState(prev => ({ ...prev, isLoading: false, error: appError }));
      onError?.(appError);
      ErrorHandler.logError(appError, 'useAsyncOperation');
      return null;
    }
  }, [operation, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useOptimisticUpdate<T>(
  initialData: T,
  updateOperation: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    const previousData = data;
    setData(optimisticData);
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateOperation(optimisticData);
      setData(result);
    } catch (err: any) {
      setData(previousData); // Rollback on error
      const appError = ErrorHandler.createError('UPDATE_FAILED', err.message);
      setError(appError);
      ErrorHandler.logError(appError, 'useOptimisticUpdate');
    } finally {
      setIsLoading(false);
    }
  }, [data, updateOperation]);

  return { data, isLoading, error, update };
}
