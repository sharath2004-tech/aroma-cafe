import axios from 'axios';
import { getFirebaseAuth } from '../firebase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current Firebase ID token to every request.
apiClient.interceptors.request.use(async (config) => {
  const firebaseUser = typeof window !== 'undefined' ? getFirebaseAuth().currentUser : null;
  if (firebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

// Handle errors. A 401 normally means the session is gone, so we send the user
// to the login page — but never for the auth endpoints themselves (/auth/sync
// runs BEFORE the profile exists on first sign-in, and /auth/me can race it),
// and never while already on an auth page, or sign-up flows get reloaded mid-flight.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? '';
    const isAuthEndpoint = requestUrl.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/auth')) {
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

  updateMe: async (payload: { name?: string; phone?: string; avatar?: string }): Promise<AuthResponse> => {
    const response = await apiClient.put('/auth/me', payload);
    return response.data;
  },
};

// Admin-only user management
export const userApi = {
  getAll: async () => {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  updateRole: async (id: string, role: 'customer' | 'chef' | 'admin') => {
    const response = await apiClient.put(`/auth/users/${id}/role`, { role });
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

  // Admin/chef: every order in the system.
  getAllAdmin: async () => {
    const response = await apiClient.get('/orders/admin/all-orders');
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
