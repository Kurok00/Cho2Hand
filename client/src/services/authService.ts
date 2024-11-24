import axios from 'axios';
import config from '../config';

interface LoginCredentials {
  username: string;  // Thay đổi từ identifier sang username
  phone?: string;    // Thêm phone là optional
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/api/auth/login`, {
      username: credentials.username,
      phone: credentials.phone,
      password: credentials.password
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }
    throw error;
  }
};

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/api/auth/register`, data);
    return response;
  } catch (error) {
    throw error;
  }
};