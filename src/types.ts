export type UserRole = 'admin' | 'user' | 'provider';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  providerId?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: any;
  updatedAt?: any;
}

export type ProjectStatus = 'active' | 'completed' | 'paused';

export interface Project {
  id: string;
  orderId: string;
  status: ProjectStatus;
  files: string[];
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: any;
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}
