import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import axios from 'axios';
import { getUsers, getAdmins, deleteUser, deleteAdmin, updateAdmin, createAdmin, getAdminByID } from '../../services/userService.ts';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    name: '',
    status: 'active'
  });
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, adminsData] = await Promise.all([
        getUsers(),
        getAdmins()
      ]);
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setError(null);
    } catch (err) {
      console.error('Error details:', err.response || err);
      setError('Có lỗi xảy ra khi tải dữ liệu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (user) => {
    try {
      const userId = user._id || user.id;
      if (!userId) {
        setError('Invalid user object');
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/password`);
      setNewUser({
        username: user.username,
        password: '',
        email: user.email,
        phone: user.phone,
        name: user.name,
        status: user.status
      });
      setCurrentUserId(userId);
      setIsEditing(true);
      setShowUserModal(true);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy mật khẩu: ' + (err.response?.data?.error || err.message));
    }
  };

  const openDeleteUserModal = (userId) => {
    if (!userId) {
      setError('User ID is undefined');
      return;
    }
    setUserToDelete(userId);
    setShowDeleteUserModal(true);
  };

  const openDeleteAdminModal = (adminId) => {
    if (!adminId) {
      setError('Admin ID is undefined');
      return;
    }
    setAdminToDelete(adminId);
    setShowDeleteAdminModal(true);
  };

  const handleBlockUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, { status: 'blocked' });
      setUsers(users.map(user => user._id === userId ? { ...user, status: 'blocked' } : user));
    } catch (err) {
      setError('Có lỗi xảy ra khi khóa người dùng: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete);
      setShowDeleteUserModal(false);
      fetchData();
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa người dùng: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await deleteAdmin(adminToDelete);
      setAdmins(admins.filter(admin => admin._id !== adminToDelete));
      setShowDeleteAdminModal(false);
      fetchData();
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa admin: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditAdmin = async () => {
    try {
      const response = await updateAdmin(currentUserId, newUser);
      setAdmins(admins.map(admin => admin._id === currentUserId ? response : admin));
      setShowAdminModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError('Có lỗi xảy ra khi sửa admin: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users', newUser);
      setUsers([...users, response.data]);
      setShowUserModal(false);
      resetForm();
    } catch (err) {
      setError('Có lỗi xảy ra khi thêm người dùng: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddAdmin = async () => {
    try {
      const response = await createAdmin(newUser);
      if (!response || !response.id) {
        throw new Error('Invalid response data');
      }
      setShowAdminModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError('Có lỗi xảy ra khi thêm admin: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setNewUser({
      username: '',
      password: '',
      email: '',
      phone: '',
      name: '',
      status: 'active'
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };
  
  const handleEditUser = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${currentUserId}`, newUser);
      setUsers(users.map(user => user._id === currentUserId ? response.data : user));
      setShowUserModal(false);
      resetForm();
    } catch (err) {
      setError('Có lỗi xảy ra khi sửa người dùng: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEditAdminModal = async (adminId) => {
    try {
      console.log("Admin ID passed to openEditAdminModal:", adminId);
      if (!adminId) {
        console.error("Admin ID is undefined");
        setError('Admin ID is undefined');
        return;
      }
      const admin = await getAdminByID(adminId);
      setNewUser({
        username: admin.username,
        password: '',
        name: admin.name,
        status: admin.status
      });
      setCurrentUserId(admin._id || admin.id);
      setIsEditing(true);
      setShowAdminModal(true);
    } catch (err) {
      console.error("Error in openEditAdminModal:", err);
      setError('Có lỗi xảy ra khi lấy thông tin admin: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditAdminClick = (admin) => {
    console.log("Admin object passed to handleEditAdminClick:", admin);
    openEditAdminModal(admin._id || admin.id);
  };

  // Add error display
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-management">
      <div className="tables-container">
        {/* User Management Table */}
        <div className="table-section">
          <h2>Quản lý tài khoản người dùng</h2>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="users-table">
              <div className="table-actions">
                <button className="add-btn" onClick={() => setShowUserModal(true)}>Thêm người dùng mới</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Tên người dùng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={`status ${user.status}`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="edit-btn" onClick={() => {
                          openEditModal(user);
                        }}>Sửa</button>
                        <button className="block-btn" onClick={() => {
                          const userId = user._id || user.id;
                          handleBlockUser(userId);
                        }}>Khóa</button>
                        <button className="delete-btn" onClick={() => {
                          const userId = user._id || user.id;
                          openDeleteUserModal(userId);
                        }}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Management Table */}
        <div className="table-section">
          <h2>Quản lý tài khoản Admin</h2>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="admins-table">
              <div className="table-actions">
                <button className="add-btn" onClick={() => {
                  setIsEditing(false);
                  setNewUser({
                    username: '',
                    password: '',
                    name: '',
                    status: 'active'
                  });
                  setShowAdminModal(true);
                }}>Thêm Admin mới</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Tên admin</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin?._id}>
                      <td>{admin?.name || 'N/A'}</td>
                      <td>{admin?.username || 'N/A'}</td>
                      <td>
                        <span className={`status ${admin?.status || 'active'}`}>
                          {admin?.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditAdminClick(admin)}>Sửa</button>
                        <button className="delete-btn" onClick={() => openDeleteAdminModal(admin._id || admin.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Sửa người dùng' : 'Thêm người dùng mới'}</h2>
            <label>
              Tên đăng nhập:
              <input type="text" name="username" value={newUser.username} onChange={handleInputChange} />
            </label>
            <label>
              Mật khẩu:
              <input type="text" name="password" value={newUser.password} onChange={handleInputChange} />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={newUser.email} onChange={handleInputChange} />
            </label>
            <label>
              Số điện thoại:
              <input type="text" name="phone" value={newUser.phone} onChange={handleInputChange} />
            </label>
            <label>
              Tên hiển thị:
              <input type="text" name="name" value={newUser.name} onChange={handleInputChange} />
            </label>
            <div className="modal-actions">
              <button onClick={isEditing ? handleEditUser : handleAddUser}>
                {isEditing ? 'Sửa' : 'Thêm'}
              </button>
              <button onClick={() => { setShowUserModal(false); resetForm(); }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Sửa admin' : 'Thêm admin mới'}</h2>
            <label>
              Tên đăng nhập:
              <input type="text" name="username" value={newUser.username} onChange={handleInputChange} />
            </label>
            <label>
              Mật khẩu:
              <input type="text" name="password" value={newUser.password} onChange={handleInputChange} />
            </label>
            <label>
              Tên hiển thị:
              <input type="text" name="name" value={newUser.name} onChange={handleInputChange} />
            </label>
            <label>
              Trạng thái:
              <select name="status" value={newUser.status} onChange={handleInputChange}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </label>
            <div className="modal-actions">
              <button onClick={isEditing ? handleEditAdmin : handleAddAdmin}>
                {isEditing ? 'Sửa' : 'Thêm Admin'}
              </button>
              <button onClick={() => { setShowAdminModal(false); resetForm(); }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận xóa người dùng</h2>
            <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteUser}>Xóa</button>
              <button onClick={() => setShowDeleteUserModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAdminModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận xóa admin</h2>
            <p>Bạn có chắc chắn muốn xóa admin này không?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteAdmin}>Xóa</button>
              <button onClick={() => setShowDeleteAdminModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
