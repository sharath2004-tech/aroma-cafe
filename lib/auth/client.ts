import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'chef' | 'admin';
}

export interface AuthResponse {
  user: any;
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const menuApi = {
  getAll: async () => {
    const response = await apiClient.get('/menu');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/menu', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/menu/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/menu/${id}`);
  },
};

export const orderApi = {
  getAll: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export const bookingApi = {
  getAll: async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/bookings/${id}`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default apiClient;
