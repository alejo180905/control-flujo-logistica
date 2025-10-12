// Temporarily force the backend URL to Heroku while debugging env loading issues.
// Revert this change after verifying the frontend -> backend flow works.
const API_URL = 'https://cfl-alejo-2ec7d198caad.herokuapp.com/api';

// Debug helper: show which API base URL the client is using (temporary)
console.log('DEBUG API_URL =', API_URL);

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { token, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    // Try to parse JSON error, otherwise return text (helps debugging HTML errors)
    try {
      const error = await response.json();
      throw new Error(error.message || JSON.stringify(error));
    } catch (e) {
      const text = await response.text();
      throw new Error(text || 'Ha ocurrido un error');
    }
  }

  try {
    return await response.json();
  } catch (e) {
    const text = await response.text();
    // Return text inside an object to keep a predictable shape for callers
    return { text } as any;
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Dashboard
  getStats: (token: string) =>
    fetchApi('/dashboard/stats', {
      token,
    }),

  // Pedidos
  getPedidos: (token: string) =>
    fetchApi('/pedidos', {
      token,
    }),
  createPedido: (token: string, pedido: any) =>
    fetchApi('/pedidos', {
      method: 'POST',
      token,
      body: JSON.stringify(pedido),
    }),
  updatePedido: (token: string, id: string, pedido: any) =>
    fetchApi(`/pedidos/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(pedido),
    }),
  deletePedido: (token: string, id: string) =>
    fetchApi(`/pedidos/${id}`, {
      method: 'DELETE',
      token,
    }),

  // Usuarios
  getUsers: (token: string) =>
    fetchApi('/usuarios', {
      token,
    }),
  createUser: (token: string, user: any) =>
    fetchApi('/usuarios', {
      method: 'POST',
      token,
      body: JSON.stringify(user),
    }),
  updateUser: (token: string, id: string, user: any) =>
    fetchApi(`/usuarios/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(user),
    }),
  deleteUser: (token: string, id: string) =>
    fetchApi(`/usuarios/${id}`, {
      method: 'DELETE',
      token,
    }),
};