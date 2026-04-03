import { useState, useTransition } from 'react';

export function useMutation<T, R>(
  action: (data: T) => Promise<R>,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
  }
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const mutate = (data: T) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await action(data);
        options?.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Something went wrong');
        setError(error);
        options?.onError?.(error);
      }
    });
  };

  return { mutate, isPending, error };
}
