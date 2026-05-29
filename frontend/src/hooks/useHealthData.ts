// frontend/src/hooks/useHealthData.ts
import { useState, useCallback } from 'react';

const API_HOST = '';

interface FetchOptions {
  token: string;
}

interface UseHealthDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<T | null>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useHealthData<T>(
  endpoint: string,
  options: FetchOptions,
  fallbackData?: T
): UseHealthDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_HOST}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${options.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const json: T = await res.json();
      setData(json);
      return json;
    } catch (err: any) {
      const msg = err.message ?? 'Erro de conexão com o servidor';
      setError(msg);
      // Usa fallback se fornecido (mantém experiência visual mesmo sem backend)
      if (fallbackData !== undefined) {
        setData(fallbackData);
        return fallbackData;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.token]);

  return { data, loading, error, fetch: fetchData, setData };
}
