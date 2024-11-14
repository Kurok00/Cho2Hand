import { useState, useEffect } from 'react';
import { Product } from '../types/product';

export const useProducts = (category?: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = category 
                    ? `http://localhost:8080/api/products?category=${category}`
                    : 'http://localhost:8080/api/products';
                    
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const result = await response.json();
                // Kiểm tra và lấy data từ response
                if (result.data) {
                    setProducts(result.data);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    return { products, loading, error };
};