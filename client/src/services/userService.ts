import axios from 'axios';

const API_URL = 'https://cho2hand-3.onrender.com/api'; // Keep the port at 5000

// Add authentication headers
const getAuthHeaders = () => {
  const adminData = localStorage.getItem('adminData');
  return adminData ? {
    headers: {
      'Authorization': `Bearer ${JSON.parse(adminData).token}`,
    }
  } : {};
};

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const response = await axios.get(`${API_URL}/admins`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: string) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAdminByID = async (adminId: string) => {
  try {
    const response = await axios.get(`${API_URL}/admins/${adminId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
};

export const updateAdmin = async (adminId: string, adminData: any) => {
  try {
    const response = await axios.put(`${API_URL}/admins/${adminId}`, adminData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

export const createAdmin = async (adminData: any) => {
  const response = await axios.post('https://cho2hand-3.onrender.com/api/admins', adminData);
  return response.data;
};

export const deleteAdmin = async (adminId: string) => {
  try {
    console.log('Sending request to delete admin with ID:', adminId); // Add logging
    const response = await axios.delete(`${API_URL}/admins/${adminId}`, getAuthHeaders());
    console.log('Response from delete admin request:', response.data); // Add logging
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error); // Add logging
    throw error;
  }
};