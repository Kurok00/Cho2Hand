export interface Product {
    _id: string;
    name: string;        // Added name field
    description: string;
    category: string;
    price: number;
    images: string[];
    location: string;
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}