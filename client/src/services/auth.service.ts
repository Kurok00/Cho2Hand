const API_URL = 'http://localhost:8080/api/auth';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export const authService = {
    async login(data: LoginData) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Đăng nhập thất bại');
        }

        return response.json();
    },

    async register(data: RegisterData) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Đăng ký thất bại');
        }

        return response.json();
    }
};