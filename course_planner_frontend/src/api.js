const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://vscode-internal-33199-qa.qa01.cloud.kavia.ai:3001/api';

// PUBLIC_INTERFACE
export async function apiFetch(path, options = {}) {
  /** Fetch wrapper that includes JSON handling and session cookie support. */
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
