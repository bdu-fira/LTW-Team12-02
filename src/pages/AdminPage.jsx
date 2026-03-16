import { useEffect, useMemo, useState } from 'react'
import './AdminPage.css'

export function AdminPage({ user, onApprove, onUserUpdate, onUserDelete, onLogout }) {
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('email')
  const [sortDir, setSortDir] = useState('asc')
  const [editingEmail, setEditingEmail] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', approved: false })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const users = JSON.parse(window.localStorage.getItem('shop-users') || '[]')
    setUsers(users)
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
      approved: Boolean(user.approved),
    })
  }

  const cancelEditing = () => {
    setEditingEmail(null)
    setEditForm({ name: '', role: '', approved: false })
  }

  const saveEdit = (email) => {
    const next = users.map((u) => {
      if (u.email !== email) return u
      const updated = {
        ...u,
        name: editForm.name,
        role: editForm.role,
        approved: editForm.role === 'staff' ? editForm.approved : true,
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

  const approve = (email) => {
    const next = users.map((u) =>
      u.email === email ? { ...u, approved: true } : u,
    )
    saveUsers(next)
    if (onApprove) onApprove(email)
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
          <p>Quản lý người dùng, duyệt nhân viên, chỉnh sửa và xóa tài khoản.</p>
        </div>
        <button className="button button--secondary" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="adminPage__toolbar">
        <input
          className="adminPage__search"
          placeholder="Tìm theo email hoặc tên..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

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
            <th>Trạng thái</th>
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
                    u.role
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <label className="adminPage__checkbox">
                      <input
                        type="checkbox"
                        checked={editForm.approved}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, approved: e.target.checked }))
                        }
                      />
                      Duyệt
                    </label>
                  ) : u.role === 'staff' ? (
                    u.approved ? (
                      'Đã duyệt'
                    ) : (
                      <button className="button" onClick={() => approve(u.email)}>
                        Duyệt
                      </button>
                    )
                  ) : (
                    '—'
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
    </main>
  )
}
