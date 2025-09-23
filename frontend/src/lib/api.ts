const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    const error = await response.json();
    throw new Error(error.message || 'Ha ocurrido un error');
  }

  return response.json();
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