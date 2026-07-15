export type UserRole = 'customer' | 'chef' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
  preparationTime: number; // in minutes
  createdAt: Date;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  price: number;
}

export interface PreOrder {
  id: string;
  customerId: string;
  customer?: User;
  items: CartItem[];
  totalPrice: number;
  readyTime: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  tableNumber?: number;
  specialNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableBooking {
  id: string;
  customerId: string;
  customer?: User;
  tableNumber: number;
  guestCount: number;
  bookingTime: Date;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  userId: string;
  type: 'new_order' | 'status_update' | 'ready' | 'cancelled';
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  ordersToday: number;
  revenueToday: number;
}
