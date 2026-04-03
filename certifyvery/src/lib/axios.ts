// Lightweight fetch-based HTTP helper to avoid external dependency on axios
const baseURL = import.meta.env.VITE_API_URL || '';

async function request(method: string, url: string, data?: any, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };

  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOpts: RequestInit = {
    method,
    headers,
    ...opts,
  };

  if (data) {
    fetchOpts.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  const res = await fetch(baseURL + url, fetchOpts);
  const contentType = res.headers.get('content-type') || '';

  let body: any = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const error: any = new Error(body?.message || res.statusText || 'Request failed');
    error.status = res.status;
    error.data = body;
    throw error;
  }

  return { data: body, status: res.status, headers: res.headers };
}

const api = {
  get: (url: string, opts?: RequestInit) => request('GET', url, undefined, opts),
  post: (url: string, data?: any, opts?: RequestInit) => request('POST', url, data, opts),
  put: (url: string, data?: any, opts?: RequestInit) => request('PUT', url, data, opts),
  delete: (url: string, data?: any, opts?: RequestInit) => request('DELETE', url, data, opts),
};

export default api;
