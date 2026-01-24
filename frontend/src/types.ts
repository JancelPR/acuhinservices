
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
  unit?: string;
  lowStockThreshold?: number;
  barcode?: string;
}

export type CategoryType = string;

export interface CartItem extends Product {
  quantity: number;
}

export interface ReceiptData {
  items: CartItem[];
  total: number;
  date: string;
  id: string;
  payment?: number;
  change?: number;
}

export const CATEGORIES: string[] = ['All', 'Snacks', 'Drinks', 'Toiletries', 'Canned Goods'];
