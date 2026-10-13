import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../config/site';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#faf8f5',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e8e1d5',
          boxShadow: '0 8px 30px rgba(44, 40, 37, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            backgroundColor: '#2c2825',
            color: '#ffffff',
            padding: '2rem 1.75rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#766352',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Shield size={24} color="#ffffff" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {SITE_CONFIG.name}
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#c9c1b7', marginTop: '0.25rem' }}>
            Khu vực Quản trị Sản phẩm
          </p>
        </div>

        {/* Notice if Supabase not yet connected */}
        {!isSupabaseConfigured && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: '#fff8e6',
              borderBottom: '1px solid #f0e2b8',
              fontSize: '0.8rem',
              color: '#855d14',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Chưa kết nối Supabase:</strong> Vui lòng cấu hình các biến môi trường{' '}
              <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> trong file <code>.env</code>.
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem 1.75rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fdeeed',
                border: '1px solid #f9c7c4',
                color: '#b71c1c',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Email Quản trị
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9e9387',
                }}
              />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="admin@nhacomuinang.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9e9387',
                }}
              />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <span>Đăng nhập Quản trị</span>
            )}
          </button>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f0eae1',
              textAlign: 'center',
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                color: '#766352',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} />
              <span>Quay về trang mua sắm</span>
            </Link>
          </div>
        </form>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.775rem', color: '#8c8277', textAlign: 'center', maxWidth: '360px' }}>
        Hệ thống chỉ cấp quyền cho 1 tài khoản Admin duy nhất được chỉ định trong cơ sở dữ liệu Supabase.
      </p>
    </div>
  );
};
