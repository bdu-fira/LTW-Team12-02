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

  useEffect(() => {
    loadUsers()
  }, [])

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
        approved: true, // Auto-approved
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
      <main className="adminPage">
        <h1>Không được phép</h1>
        <p>Chỉ quản trị viên mới có thể truy cập trang này.</p>
      </main>
    )
  }

  return (
    <main className="adminPage">
      <div className="adminPage__header">
        <div>
          <h1>Quản lý tài khoản</h1>
          <p>Quản lý người dùng, phân quyền truy cập, chỉnh sửa và xóa tài khoản.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="button" onClick={() => navigate('/')}>
            Trang chủ
          </button>
          <button className="button button--secondary" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="adminPage__toolbar">
        <input
          className="adminPage__search"
          placeholder="Tìm theo email hoặc tên..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="adminPage__tableWrapper" style={{ overflowX: 'auto' }}>
      <table className="adminPage__table">
        <thead>
          <tr>
            <th>STT</th>
            <th onClick={() => toggleSort('email')}>
              Email {sortKey === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => toggleSort('name')}>
              Họ tên {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => toggleSort('role')}>
              Vai trò {sortKey === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, idx) => {
            const isEditing = editingEmail === u.email
            return (
              <tr key={u.email} className={u.email === user.email ? 'adminPage__row--self' : ''}>
                <td>{idx + 1}</td>
                <td>{u.email}</td>
                <td>
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  ) : (
                    u.name || '---'
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị</option>
                    </select>
                  ) : (
                    <span className={`badge badge--${u.role}`} style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '500',
                      backgroundColor: u.role === 'admin' ? '#ffebee' : u.role === 'staff' ? '#e3f2fd' : '#e8f5e9',
                      color: u.role === 'admin' ? '#c62828' : u.role === 'staff' ? '#1565c0' : '#2e7d32'
                    }}>
                      {u.role === 'admin' ? 'Quản trị' : u.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                    </span>
                  )}
                </td>
                <td className="adminPage__actions">
                  {isEditing ? (
                    <>
                      <button className="button" onClick={() => saveEdit(u.email)}>
                        Lưu
                      </button>
                      <button className="button button--secondary" onClick={cancelEditing}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="button" onClick={() => startEditing(u)}>
                        Sửa
                      </button>
                      <button className="button button--danger" onClick={() => removeUser(u.email)}>
                        Xóa
                      </button>
                    </>
                  )}
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
