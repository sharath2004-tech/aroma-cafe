import { create } from 'zustand';
import { authApi, bookingApi, menuApi, orderApi } from '../auth/client';
import { signInWithEmail, signInWithGoogle, signOutUser, signUpWithEmail, subscribeToAuthChanges } from '../firebase/auth';
import type { User, CartItem, MenuItem, PreOrder, OrderNotification, TableBooking } from '../types';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  loginWithGoogle: (role?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

interface MenuStore {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, item: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => MenuItem | undefined;
}

interface NotificationStore {
  notifications: OrderNotification[];
  unreadCount: number;
  addNotification: (notification: OrderNotification) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

interface OrderStore {
  orders: PreOrder[];
  currentOrder: PreOrder | null;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (order: Partial<PreOrder>) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  clearCurrentOrder: () => void;
}

interface BookingStore {
  bookings: TableBooking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Partial<TableBooking>) => Promise<void>;
  updateBooking: (id: string, booking: Partial<TableBooking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

// The Express API returns Mongo-shaped orders (_id/userId/totalAmount/notes);
// map them onto the frontend's PreOrder shape.
function mapOrderResponse(order: any): PreOrder {
  return {
    id: order._id,
    customerId: typeof order.userId === 'string' ? order.userId : order.userId?._id,
    customer: typeof order.userId === 'object' ? order.userId : undefined,
    items: (order.items ?? []).map((item: any) => ({
      id: item._id ?? item.menuItemId,
      menuItemId: item.menuItemId,
      menuItem: {
        id: item.menuItemId,
        name: item.name,
        description: '',
        price: item.price,
        image: item.image,
        category: '',
        available: true,
        preparationTime: 0,
        createdAt: order.createdAt
      },
      quantity: item.quantity,
      notes: item.notes,
      price: item.price
    })),
    totalPrice: order.totalAmount,
    readyTime: order.updatedAt,
    status: order.status,
    tableNumber: order.tableNumber ? Number(order.tableNumber) : undefined,
    specialNotes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function mapBookingResponse(booking: any): TableBooking {
  return {
    id: booking._id,
    customerId: typeof booking.customerId === 'string' ? booking.customerId : booking.customerId?._id,
    customer: typeof booking.customerId === 'object' ? booking.customerId : undefined,
    tableNumber: booking.tableNumber,
    guestCount: booking.guestCount,
    bookingTime: booking.bookingTime,
    duration: booking.duration,
    status: booking.status,
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmail(email, password);
      const { user } = await authApi.sync();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      await signUpWithEmail(name, email, password);
      const { user } = await authApi.sync({ name, role: role as 'customer' | 'chef' | 'admin' });
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async (role?: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await signInWithGoogle();
      const { user } = await authApi.sync({
        name: firebaseUser.displayName ?? undefined,
        role: role as 'customer' | 'chef' | 'admin' | undefined
      });
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await signOutUser();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),

  // Restores the session on page load/refresh. Firebase persists its own
  // session; once it reports a user we fetch the matching Mongo profile.
  initialize: () => {
    return subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { user } = await authApi.getCurrentUser();
          set({ user, isInitializing: false });
        } catch {
          set({ user: null, isInitializing: false });
        }
      } else {
        set({ user: null, isInitializing: false });
      }
    });
  },
}));

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const existingItem = get().items.find(i => i.menuItemId === item.menuItemId);
    if (existingItem) {
      set(state => ({
        items: state.items.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }));
    } else {
      set(state => ({ items: [...state.items, item] }));
    }
  },
  
  removeItem: (itemId) => {
    set(state => ({ items: state.items.filter(i => i.id !== itemId) }));
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
    } else {
      set(state => ({
        items: state.items.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      }));
    }
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  loading: false,
  error: null,
  
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { items } = await menuApi.getAll();
      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },
  
  addItem: (item) => {
    set(state => ({ items: [...state.items, item] }));
  },
  
  updateItem: (id, item) => {
    set(state => ({
      items: state.items.map(i => (i.id === id ? { ...i, ...item } : i))
    }));
  },
  
  deleteItem: (id) => {
    set(state => ({ items: state.items.filter(i => i.id !== id) }));
  },
  
  getItemById: (id) => {
    return get().items.find(i => i.id === id);
  },
}));

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { orders } = await orderApi.getAll();
      set({ orders: orders.map(mapOrderResponse), loading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { order } = await orderApi.getById(id);
      set({ currentOrder: mapOrderResponse(order), loading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },

  createOrder: async (order) => {
    set({ loading: true, error: null });
    try {
      const { order: created } = await orderApi.create(order);
      const mapped = mapOrderResponse(created);
      set((state) => ({ orders: [mapped, ...state.orders], currentOrder: mapped, loading: false }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const { order } = await orderApi.updateStatus(id, status);
      const mapped = mapOrderResponse(order);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? mapped : o)),
        currentOrder: state.currentOrder?.id === id ? mapped : state.currentOrder,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },

  cancelOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { order } = await orderApi.cancel(id);
      const mapped = mapOrderResponse(order);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? mapped : o)),
        currentOrder: state.currentOrder?.id === id ? mapped : state.currentOrder,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },
  
  clearCurrentOrder: () => set({ currentOrder: null }),
}));

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  loading: false,
  error: null,
  
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const { bookings } = await bookingApi.getAll();
      set({ bookings: bookings.map(mapBookingResponse), loading: false });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },

  createBooking: async (booking) => {
    set({ loading: true, error: null });
    try {
      const { booking: created } = await bookingApi.create(booking);
      set((state) => ({ bookings: [mapBookingResponse(created), ...state.bookings], loading: false }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
      throw error;
    }
  },

  updateBooking: async (id, booking) => {
    set({ loading: true, error: null });
    try {
      const { booking: updated } = await bookingApi.update(id, booking);
      const mapped = mapBookingResponse(updated);
      set((state) => ({ bookings: state.bookings.map((b) => (b.id === id ? mapped : b)), loading: false }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },

  cancelBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const { booking: cancelled } = await bookingApi.cancel(id);
      const mapped = mapBookingResponse(cancelled);
      set((state) => ({ bookings: state.bookings.map((b) => (b.id === id ? mapped : b)), loading: false }));
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? (error as Error).message, loading: false });
    }
  },
}));
