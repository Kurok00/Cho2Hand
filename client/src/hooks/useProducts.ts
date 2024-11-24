import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Location {
  city_id: string;
  district_id: string;
  city: {
    _id: string;
    name: string;
  };
  district: {
    _id: string;
    name: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  location: Location;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (category?: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const url = category 
                ? `https://cho2hand-3.onrender.com/api/products?category=${category}`
                : 'https://cho2hand-3.onrender.com/api/products';
            
            console.log('Fetching products from:', url);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Fetched products:', result); // Log the response

            if (result?.status === 200 && result.data != null && Array.isArray(result.data)) {
                setProducts(result.data);
            } else {
                console.error('Invalid response format:', result); // Log the invalid response
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, fetchProducts };
};