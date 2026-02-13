import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and manage CSRF token
 * Token is fetched once on mount and cached for the session
 */
export function useCsrf() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/csrf');

        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();

        if (mounted) {
          setToken(data.csrfToken);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      mounted = false;
    };
  }, []);

  return { token, loading, error };
}

/**
 * Helper function to create fetch options with CSRF token
 */
export function withCsrf(
  token: string | null,
  options: RequestInit = {}
): RequestInit {
  if (!token) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': token,
    },
  };
}
