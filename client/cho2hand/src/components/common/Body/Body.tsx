import React from 'react';
import { useProducts } from '../../../hooks/useProducts.ts';
import './Body.css';

const BodyComponent: React.FC = () => {
  const { products = [], loading, error } = useProducts(); // Provide default empty array

  return (
    <div className="container">
      <div className='body'>
        <div className="banner">
          <img src="/banner.jpg" alt="Banner" />
        </div>

        <div className="category">
          <div style={{ textAlign: 'left', marginLeft: '15px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Danh Mục</p>     
          </div>
          
          <div className="category-grid">
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Điện Thoại & Laptop" />
              <span>Điện Thoại & Laptop</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="PC & Linh Kiện PC" />
              <span>PC & Linh Kiện PC</span>
            </a>
            <a href="#">
              <img src="accessories.jpg" alt="Phụ Kiện Thông Minh" />
              <span>Phụ Kiện Thông Minh</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Thời Trang Nam" />
              <span>Thời Trang Nam</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Thời Trang Nữ" />
              <span>Thời Trang Nữ</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Mẹ & Bé" />
              <span>Mẹ & Bé</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Thiết Bị Điện Tử" />
              <span>Thiết Bị Điện Tử</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Sắc Đẹp" />
              <span>Sắc Đẹp</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Máy Ảnh & Máy Quay Phim" />
              <span>Máy Ảnh & Máy Quay Phim</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Sức Khỏe" />
              <span>Sức Khỏe</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Đồng Hồ" />
              <span>Đồng Hồ</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp.jpg" alt="Giày Dép Nữ" />
              <span>Giày Dép Nữ</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp.jpg" alt="Giày Dép Nam" />
              <span>Giày Dép Nam</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Túi Ví Nữ" />
              <span>Túi Ví Nữ</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Nước Hoa" />
              <span>Nước Hoa</span>
            </a>
            <a href="#">
              <img src="https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w320_nl.webp" alt="Nhà Sách Online" />
              <span>Nhà Sách Online</span>
            </a>
          </div>
        </div>

        <div className="tin-dang">
          <div style={{ textAlign: 'left', marginLeft: '15px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Tin Đăng</p>     
          </div>
          
          <div className="tin-dang-grid">
            {loading ? (
              <div className="loading-state">Đang tải sản phẩm...</div>
            ) : error ? (
              <div className="error-state">Lỗi: {error}</div>
            ) : products && products.length > 0 ? ( // Add null check here
              products.map(product => (
                <a key={product.id} href={`/product/${product.id}`} className="product-card">
                  <img 
                    src={product.images[0] || '/placeholder.jpg'} 
                    alt={product.description}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg'
                    }}
                  />
                  <span className="product-desc">{product.description}</span>
                  <span className="price">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </span>
                </a>
              ))
            ) : (
              <div className="empty-state">Không có sản phẩm nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyComponent;