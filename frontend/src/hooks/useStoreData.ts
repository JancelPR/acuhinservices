import { useState, useEffect } from 'react';
import { Product, ReceiptData, CATEGORIES } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { api } from '../services/api';
import { useStickyState } from './useStickyState';

export const useStoreData = () => {
  const [products, setProducts] = useStickyState<Product[]>(INITIAL_PRODUCTS, 'acuhin-store-products');
  const [transactions, setTransactions] = useStickyState<ReceiptData[]>([], 'acuhin-store-transactions');
  const [categories, setCategories] = useStickyState<string[]>(CATEGORIES, 'acuhin-categories');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch products and transactions from the API
        const [fetchedProducts, fetchedTransactions] = await Promise.all([
          api.getProducts(),
          api.getTransactions()
        ]);
        
        // Always update with data from API (even if empty array)
        setProducts(fetchedProducts);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Failed to fetch data from API:', error);
        // If API fails, keep using localStorage/initial data as fallback
        console.warn('Using local storage data as fallback');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update categories automatically based on products
  useEffect(() => {
    setCategories(prev => {
        const categoriesFromProducts = products.map(p => p.category);
        const combined = Array.from(new Set([...prev, ...categoriesFromProducts]));
        if (combined.length !== prev.length) return combined;
        return prev;
    });
  }, [products, setCategories]);

  return {
    products,
    setProducts,
    transactions,
    setTransactions,
    categories,
    setCategories,
    isLoading
  };
};