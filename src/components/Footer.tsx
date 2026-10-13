import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Clock, Shield } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877f2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="#e1306c" />
  </svg>
);

const ThreadsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24C5.46 24 0 18.54 0 11.814 0 5.088 5.46 0 12.186 0c6.642 0 12.03 5.304 12.138 11.946v.378c-.036 3.612-1.902 6.702-4.992 8.268-2.61 1.32-5.7.99-8.028-.858a7.127 7.127 0 0 1-2.904-5.718c0-4.008 3.258-7.266 7.266-7.266 3.6 0 6.6 2.67 7.128 6.222.096.648.546 1.152 1.182 1.152.69 0 1.254-.57 1.254-1.266-.63-4.836-4.71-8.508-9.564-8.508-5.328 0-9.666 4.338-9.666 9.666 0 5.328 4.338 9.666 9.666 9.666 5.25 0 9.534-4.212 9.666-9.456H21.84c-.132 4.092-3.486 7.374-7.584 7.374-.636 0-1.152.516-1.152 1.152s.516 1.152 1.152 1.152c-.024.324-.048.336-.07.336z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#26221f',
        color: '#e5ded5',
        marginTop: 'auto',
        borderTop: '1px solid #3d3630',
        paddingTop: '3rem',
        paddingBottom: '2rem',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Brand Info & Socials */}
          <div>
            <h3
              className="font-serif"
              style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.65rem' }}
            >
              {SITE_CONFIG.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#b5a999', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {SITE_CONFIG.tagline}. Chúng mình tin rằng một chiếc giường mộc mạc từ sợi tự nhiên sẽ
              ôm ấp những mỏi mệt và mang lại năng lượng trong lành nhất mỗi ngày.
            </p>

            {/* Social Media Links */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a
                href={SITE_CONFIG.contact.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                }}
                title="Facebook: Nhà có mùi nắng"
              >
                <FacebookIcon />
                <span>Facebook</span>
              </a>

              <a
                href={SITE_CONFIG.contact.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                }}
                title="Instagram: @nhacomuinang"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>

              <a
                href={SITE_CONFIG.contact.threads.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                }}
                title="Threads: @nhacomuinang"
              >
                <ThreadsIcon />
                <span>Threads</span>
              </a>
            </div>
          </div>

          {/* Quick Contact & Inquiries */}
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.85rem',
              }}
            >
              Tư vấn & Mua hàng
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#b5a999', marginBottom: '0.85rem' }}>
              Nhắn tin trực tiếp để kiểm tra kích thước đệm, xem video/ảnh thực tế ánh sáng tự nhiên và chốt đơn:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={SITE_CONFIG.contact.zalo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  justifyContent: 'flex-start',
                }}
              >
                <MessageCircle size={16} style={{ color: '#0088cc' }} />
                <span>Zalo: {SITE_CONFIG.contact.zalo.displayPhone}</span>
              </a>

              <a
                href={SITE_CONFIG.contact.messenger.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  justifyContent: 'flex-start',
                }}
              >
                <MessageCircle size={16} style={{ color: '#0084ff' }} />
                <span>Messenger: Nhắn tin Facebook</span>
              </a>
            </div>
          </div>

          {/* Business Details & Admin Access */}
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.85rem',
              }}
            >
              Thông tin cửa tiệm
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem', color: '#b5a999' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#a39482' }} />
                <span>{SITE_CONFIG.contact.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ flexShrink: 0, color: '#a39482' }} />
                <span>Hotline: {SITE_CONFIG.contact.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} style={{ flexShrink: 0, color: '#a39482' }} />
                <span>Hỗ trợ: {SITE_CONFIG.contact.openHours}</span>
              </div>

              {/* Clear Admin Access Link in Footer */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link
                  to="/admin/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#c9c1b7',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                  }}
                >
                  <Shield size={14} color="#a39482" />
                  <span>Khu vực Quản trị Admin</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#7a7063' }}>
          © {new Date().getFullYear()} {SITE_CONFIG.name}. Product Catalog Online.
        </div>
      </div>
    </footer>
  );
};
