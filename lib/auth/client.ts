import axios from 'axios';
import { auth } from '../firebase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current Firebase ID token to every request.
apiClient.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface SyncPayload {
  name?: string;
  role?: 'customer' | 'chef' | 'admin';
}

export interface AuthResponse {
  user: any;
}

export const authApi = {
  // Idempotent: creates the Mongo profile on first Firebase sign-in, otherwise
  // just returns the existing one. Call after every successful Firebase auth action.
  sync: async (payload: SyncPayload = {}): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/sync', payload);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
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
