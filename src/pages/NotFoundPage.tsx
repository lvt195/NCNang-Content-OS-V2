import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '460px' }}>
          <span
            className="font-serif"
            style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--accent-brown)', lineHeight: 1 }}
          >
            404
          </span>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', marginTop: '1rem', marginBottom: '0.75rem' }}>
            Trang không tồn tại
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không tồn tại trong danh mục sản phẩm của tiệm.
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};
