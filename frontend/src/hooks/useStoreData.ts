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
        // Fetch products, transactions, and categories from the API
        const [fetchedProducts, fetchedTransactions, fetchedCategories] = await Promise.all([
          api.getProducts(),
          api.getTransactions(),
          api.getCategories()
        ]);
        
        // Always update with data from API (even if empty array)
        setProducts(fetchedProducts);
        setTransactions(fetchedTransactions);
        // Only set categories if we got some back, otherwise keep defaults
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch data from API:', error);
        // If API fails, keep using localStorage/initial data as fallback
        console.warn('Using local storage data as fallback');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setCategories, setProducts, setTransactions]);

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