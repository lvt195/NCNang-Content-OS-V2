import React from 'react';
import { MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#26221f',
        color: '#e5ded5',
        marginTop: 'auto',
        borderTop: '1px solid #3d3630',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Brand Info */}
          <div>
            <h3
              className="font-serif"
              style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.75rem' }}
            >
              {SITE_CONFIG.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#b5a999', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {SITE_CONFIG.tagline}. Chúng mình tin rằng một chiếc giường mộc mạc từ sợi tự nhiên sẽ
              ôm ấp những mỏi mệt và mang lại năng lượng trong lành nhất mỗi ngày.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8c8071' }}>
              <span>© {new Date().getFullYear()} {SITE_CONFIG.name}. Tất cả các quyền được bảo lưu.</span>
            </div>
          </div>

          {/* Quick Contact & Inquiries */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Tư vấn & Đặt hàng
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#b5a999', marginBottom: '1rem' }}>
              Để kiểm tra kích thước đệm, màu vải sẵn có hoặc đặt may theo số đo riêng, quý khách vui lòng nhắn tin trực tiếp:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={SITE_CONFIG.contact.zalo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  justifyContent: 'flex-start',
                }}
              >
                <MessageCircle size={18} style={{ color: '#0088cc' }} />
                <span>Zalo: {SITE_CONFIG.contact.zalo.displayPhone}</span>
              </a>

              <a
                href={SITE_CONFIG.contact.messenger.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  justifyContent: 'flex-start',
                }}
              >
                <MessageCircle size={18} style={{ color: '#0084ff' }} />
                <span>Messenger: /{SITE_CONFIG.contact.messenger.handle}</span>
              </a>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Thông tin tiệm
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: '#b5a999' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#a39482' }} />
                <span>{SITE_CONFIG.contact.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={18} style={{ flexShrink: 0, color: '#a39482' }} />
                <span>Hotline: {SITE_CONFIG.contact.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={18} style={{ flexShrink: 0, color: '#a39482' }} />
                <span>Giờ hỗ trợ: {SITE_CONFIG.contact.openHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.775rem', color: '#7a7063' }}>
          Trang web danh mục sản phẩm (Product Catalog) phục vụ tra cứu mẫu vải & liên hệ tư vấn.
        </div>
      </div>
    </footer>
  );
};
