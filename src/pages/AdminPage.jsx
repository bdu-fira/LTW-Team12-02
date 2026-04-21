import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminPage.css'

export function AdminPage({ user, onUserUpdate, onUserDelete, onLogout }) {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('email')
  const [sortDir, setSortDir] = useState('asc')
  const [editingEmail, setEditingEmail] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '' })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadUsers()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error('Failed to fetch stats', e)
    }
  }

  const loadUsers = () => {
    try {
      const usersList = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
      setUsers(Array.isArray(usersList) ? usersList : [])
    } catch(e) {
      setUsers([])
    }
  }

  const saveUsers = (next) => {
    window.localStorage.setItem('shop-users', JSON.stringify(next))
    setUsers(next)
  }

  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase()
    return users
      .filter((u) =>
        !term ||
        u.email.toLowerCase().includes(term) ||
        (u.name || '').toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1
        const valA = String(a[sortKey] ?? '').toLowerCase()
        const valB = String(b[sortKey] ?? '').toLowerCase()
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })
  }, [users, filter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const startEditing = (user) => {
    setEditingEmail(user.email)
    setEditForm({
      name: user.name || '',
      role: user.role || 'customer',
    })
  }

  const cancelEditing = () => {
    setEditingEmail(null)
    setEditForm({ name: '', role: '' })
  }

  const saveEdit = (email) => {
    const next = users.map((u) => {
      if (u.email !== email) return u
      const updated = {
        ...u,
        name: editForm.name,
        role: editForm.role,
        approved: true,
      }
      return updated
    })
    saveUsers(next)
    if (onUserUpdate) onUserUpdate(email)
    cancelEditing()
  }

  const removeUser = (email) => {
    if (!window.confirm('Xóa tài khoản này?')) return
    if (email === user?.email) {
      alert('Bạn không thể xóa chính mình.')
      return
    }
    const next = users.filter((u) => u.email !== email)
    saveUsers(next)
    if (onUserDelete) onUserDelete(email)
  }

  if (!user || user.role !== 'admin') {
    return (
      <main className="adminPage container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h1>Không được phép</h1>
        <p>Chỉ quản trị viên mới có thể truy cập trang này.</p>
        <button className="button-3d" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>Quay lại</button>
      </main>
    )
  }

  return (
    <main className="adminPage container" style={{ padding: '60px 0' }}>
      <header className="adminPage__header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Quản trị hệ thống</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quản lý tài khoản người dùng và phân quyền truy cập.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button-3d secondary" onClick={() => navigate('/')}>
            ⬅ Trang chủ
          </button>
          <button className="button-3d" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {stats && (
        <section className="adminPage__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>📊 Sản phẩm theo danh mục</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.categories?.map(c => (
                <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{c.category}</span>
                  <span style={{ fontWeight: 'bold', padding: '4px 12px', background: 'var(--bg-soft)', borderRadius: '100px' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>💰 Top khách hàng chi tiêu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topCustomers?.map(tc => (
                <div key={tc.customer_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.customer_name || 'Khách ẩn danh'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {Number(tc.total_spent).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="adminPage__toolbar" style={{ marginBottom: '30px' }}>
        <input
          className="header__search-input"
          style={{ maxWidth: '400px' }}
          placeholder="Tìm user theo email hoặc tên..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="adminPage__tableWrapper glass" style={{ borderRadius: '24px', padding: '20px', overflowX: 'auto', border: '1px solid var(--border)' }}>
      <table className="adminPage__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '15px' }}>STT</th>
            <th style={{ padding: '15px', cursor: 'pointer' }} onClick={() => toggleSort('email')}>Email</th>
            <th style={{ padding: '15px', cursor: 'pointer' }} onClick={() => toggleSort('name')}>Họ tên</th>
            <th style={{ padding: '15px', cursor: 'pointer' }} onClick={() => toggleSort('role')}>Vai trò</th>
            <th style={{ padding: '15px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, idx) => {
            const isEditing = editingEmail === u.email
            return (
              <tr key={u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px' }}>{idx + 1}</td>
                <td style={{ padding: '15px' }}>{u.email}</td>
                <td style={{ padding: '15px' }}>
                  {isEditing ? (
                    <input
                      className="header__search-input"
                      style={{ padding: '6px 12px' }}
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  ) : (
                    u.name || '---'
                  )}
                </td>
                <td style={{ padding: '15px' }}>
                  {isEditing ? (
                    <select
                      className="header__search-input"
                      style={{ padding: '6px 12px' }}
                      value={editForm.role}
                      onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị</option>
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700',
                      backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'staff' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: u.role === 'admin' ? 'var(--danger)' : u.role === 'staff' ? 'var(--primary)' : 'var(--success)',
                      border: `1px solid ${u.role === 'admin' ? 'var(--danger)' : u.role === 'staff' ? 'var(--primary)' : 'var(--success)'}`
                    }}>
                      {u.role === 'admin' ? 'Quản trị' : u.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                    </span>
                  )}
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isEditing ? (
                      <>
                        <button className="button-3d" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => saveEdit(u.email)}>Lưu</button>
                        <button className="button-3d secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={cancelEditing}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button className="button-3d secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => startEditing(u)}>Sửa</button>
                        <button className="button-3d secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => removeUser(u.email)}>Xóa</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </main>
  )
}
