import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Coke Original 330ml',
    category: 'Drinks',
    price: 20,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    description: 'Refreshing carbonated soft drink.'
  },
  {
    id: '2',
    name: 'Piattos Cheese',
    category: 'Snacks',
    price: 15,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy potato crisps with cheese flavor.'
  },
  {
    id: '3',
    name: 'Pepsi Blue',
    category: 'Drinks',
    price: 18,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1541656515-77983636f888?auto=format&fit=crop&w=600&q=80',
    description: 'A berry-flavored cola soft drink.'
  },
  {
    id: '4',
    name: 'Chippy Red',
    category: 'Snacks',
    price: 12,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    description: 'Corn chips with barbecue flavor.'
  },
  {
    id: '5',
    name: 'Safeguard Soap',
    category: 'Toiletries',
    price: 45,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1623624326574-d027f3152d1c?auto=format&fit=crop&w=600&q=80',
    description: 'Germ protection soap for the family.'
  },
   {
    id: '6',
    name: 'Corned Beef',
    category: 'Canned Goods',
    price: 65,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    description: 'Premium corned beef.'
  }
];

export const STORE_NAME = "Acuhin's Store";
export const CURRENCY = "₱";
