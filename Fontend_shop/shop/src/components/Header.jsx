import { Layout, Input, Button, Badge, Space, Typography, Menu } from 'antd';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;
const { Search } = Input;

export function Header({
  cartCount,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onManageClick,
  onOrdersClick,
  user,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeCategory,
  onCategorySelect,
  theme,
  onThemeToggle,
}) {
  const categories = [
    { key: 'Tất cả', label: 'Tất cả', icon: '🌟' },
    { key: 'Điện thoại', label: 'Điện thoại', icon: '📱' },
    { key: 'Laptop', label: 'Laptop', icon: '💻' },
    { key: 'Máy tính bảng', label: 'Máy tính bảng', icon: '📱' },
    { key: 'TV & Âm thanh', label: 'TV & Âm thanh', icon: '📺' },
    { key: 'Gia dụng', label: 'Gia dụng', icon: '🧺' },
    { key: 'Thiết bị gia dụng', label: 'Thiết bị gia dụng', icon: '🏠' },
  ];

  const menuItems = categories.map(cat => ({
    key: cat.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, fontFamily: 'inherit' }}>
        <span style={{ fontSize: '18px' }}>{cat.icon}</span>
        {cat.label}
      </span>
    )
  }));

  return (
    <AntHeader className="header">
      <div className="container">
        <div className="header__top">
          
          {/* Logo */}
          <a href="/" className="header__brand">
            <div className="header__logo-circle">🛒</div>
            <Title level={3} className="header__title" style={{ margin: 0 }}>Gia dụng Xanh</Title>
          </a>

          {/* Search */}
          <div className="header__search-container">
            <Search
              placeholder="Tìm kiếm sản phẩm công nghệ..."
              allowClear
              enterButton="Tìm kiếm"
              size="large"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onSearch={onSearchSubmit}
              className="header__search-input-wrapper"
            />
          </div>

          {/* Actions */}
          <div className="header__actions">
            <Button 
              onClick={onThemeToggle} 
              shape="circle" 
              className="header__theme-toggle"
              icon={<span>{theme === 'dark' ? '☀️' : '🌙'}</span>} 
            />
            
            {user ? (
              <Space size="middle" align="center" className="header__user-section">
                <Text className="header__greeting">
                  Chào, <strong>{user.name}</strong>
                </Text>
                
                <div className="header__user-actions">
                  {(user.role === 'staff' || user.role === 'admin') && (
                    <Button onClick={onManageClick} size="small" icon={<span>🛠️</span>}>
                      Quản lý
                    </Button>
                  )}
                  
                  <Button onClick={onOrdersClick} size="small" icon={<span>📦</span>}>
                    Đơn hàng
                  </Button>
                  
                  <Button type="text" danger onClick={onLogout} size="small" style={{ fontWeight: 600 }}>
                    Thoát
                  </Button>
                </div>
              </Space>
            ) : (
              <Button type="primary" onClick={onLoginClick} className="button-3d" style={{ transform: 'none' }}>
                Đăng nhập
              </Button>
            )}

            <Badge count={cartCount} showZero={false} className="header__cart-badge-wrapper">
              <Button 
                type="text" 
                className="header__cart-btn"
                onClick={onCartClick}
              >
                🛒
              </Button>
            </Badge>
          </div>
        </div>

        {/* Navigation / Categories */}
        <div className="header__menu-wrapper">
          <Menu 
            theme={theme === 'dark' ? 'dark' : 'light'}
            mode="horizontal" 
            selectedKeys={[activeCategory || 'Tất cả']}
            onClick={(e) => onCategorySelect?.(e.key)}
            items={menuItems}
            className="header__menu"
          />
        </div>
      </div>
    </AntHeader>
  );
}
