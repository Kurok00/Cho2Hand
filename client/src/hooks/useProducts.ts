import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';

export const useProducts = (category?: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const url = category 
                ? `http://localhost:5000/api/products?category=${category}`
                : 'http://localhost:5000/api/products';
            
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