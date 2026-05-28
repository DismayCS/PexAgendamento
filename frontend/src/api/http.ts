const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  const hasBody = response.headers.get('content-length') !== '0' && response.status !== 204;
  let data: ApiErrorBody | T | null = null;

  if (hasBody) {
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    const message = body?.error || body?.message || 'Erro inesperado ao comunicar com o servidor.';
    throw new Error(message);
  }

  return (data as T) ?? ({} as T);
}
