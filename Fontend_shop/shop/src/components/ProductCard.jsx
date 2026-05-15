import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Space, Rate } from 'antd';
import { Reviews } from './Reviews';
import './ProductCard.css';

const { Text, Title, Paragraph } = Typography;

export function ProductCard({ product, onAdd, onDelete }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  const imageUrl = String(product?.image || '') || 'https://via.placeholder.com/360x240?text=No+Image';
  const description = String(product?.description || '');

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <Card
        hoverable
        onClick={handleCardClick}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
        bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px' }}
        cover={
          <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
            <img 
              alt={product.name} 
              src={imageUrl} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Tag 
              color="#00a650" 
              style={{ position: 'absolute', top: 12, left: 12, margin: 0, fontWeight: 'bold' }}
            >
              {product.category || 'Khác'}
            </Tag>
            {(product.stock_count || 0) <= 0 && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', zIndex: 2 
              }}>
                <Tag color="red" style={{ fontSize: '16px', padding: '4px 12px', fontWeight: 'bold', border: '2px solid red' }}>HẾT HÀNG</Tag>
              </div>
            )}
          </div>
        }
      >
        <div style={{ flex: 1 }}>
          <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8, minHeight: '44px' }}>
            {product.name}
          </Title>
          
          <Paragraph 
            ellipsis={{ rows: isExpanded ? 10 : 2, expandable: true, symbol: 'Xem thêm', onExpand: (e) => { e.stopPropagation(); setIsExpanded(true); } }}
            style={{ color: '#666', fontSize: '13px', marginBottom: 12, minHeight: '40px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {description}
          </Paragraph>

          <Space split={<span style={{ color: '#e8e8e8' }}>|</span>} style={{ fontSize: '12px', marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Text type="secondary">Đã bán: <strong style={{ color: '#333' }}>{product.sold_count || 0}</strong></Text>
            <Text type="secondary">
              Còn lại: <strong style={{ color: (product.stock_count || 0) < 5 ? '#ff4d4f' : '#333' }}>{product.stock_count || 0}</strong>
            </Text>
            <div onClick={(e) => { e.stopPropagation(); setShowReviews(true); }} style={{ cursor: 'pointer' }}>
              <Rate disabled defaultValue={5} style={{ fontSize: '12px', color: '#faad14' }} />
            </div>
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Text strong style={{ color: '#d70018', fontSize: '18px' }}>
            {product.price.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </Text>
          
          <Space>
            <Button 
              type="primary" 
              style={{ background: (product.stock_count || 0) > 0 ? '#00a650' : '#8c8c8c' }}
              disabled={(product.stock_count || 0) <= 0}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
            >
              {(product.stock_count || 0) > 0 ? '🛒 Mua' : 'Hết hàng'}
            </Button>
            
            {onDelete && (
              <Button 
                danger 
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
              >
                Xóa
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {showReviews && (
        <Reviews 
          product={product} 
          onClose={(e) => { e?.stopPropagation(); setShowReviews(false); }} 
        />
      )}
    </>
  );
}
