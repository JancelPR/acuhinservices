import { Product, ReceiptData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create product' }));
        throw new Error(error.message || 'Failed to create product');
    }
    return await response.json();
  },

  async updateProduct(id: string, product: Product): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update product' }));
        throw new Error(error.message || 'Failed to update product');
    }
    return await response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete product' }));
         throw new Error(error.message || 'Failed to delete product');
    }
  },

  // Transactions
  async getTransactions(): Promise<ReceiptData[]> {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
  },

  async createTransaction(transaction: ReceiptData): Promise<ReceiptData> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create transaction' }));
        throw new Error(error.message || 'Failed to create transaction');
    }
    return await response.json();
  },

  // Auth
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.message || "Login failed");
    }
    return await response.json();
  },

  async requestOTP(data: {
    email: string;
    type: "email" | "password";
    currentEmail?: string;
    currentPassword?: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to send OTP" }));
      throw new Error(error.message || "Failed to send OTP");
    }
    return await response.json();
  },

  async verifyOTP(data: {
    email: string;
    code: string;
    type: "email" | "password";
    currentEmail?: string;
    payload?: any;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Invalid or expired code" }));
      throw new Error(error.message || "Invalid or expired code");
    }
    return await response.json();
  },
};




