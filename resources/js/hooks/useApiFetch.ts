import { useState } from 'react';
import { apiFetch } from '../lib/api-client';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call<T>(url: string, opts: RequestInit = {}) { 
    setLoading(true);
    setError(null);
    try {
      return await apiFetch<T>(url, opts);
    } catch (e: any) {
      setError(e.message || 'error');
      throw e;
    } finally { setLoading(false); }
  }

  return { loading, error, call };
}
