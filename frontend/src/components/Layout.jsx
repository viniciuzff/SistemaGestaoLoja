import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const nav = [
  { to: '/',         icon: '',  label: 'Dashboard', end: true },
  { to: '/clientes', icon: '', label: 'Clientes' },
  { to: '/produtos',  icon: '', label: 'Produtos' },
  { to: '/vendas',    icon: '', label: 'Vendas' },
  { to: '/estoque',   icon: '', label: 'Estoque' },
]

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await axios.post('/api/logout', {}, { withCredentials: true })
    onLogout()
    navigate('/login')
  }

  const pageTitle = {
    '/': 'Dashboard',
    '/clientes': 'Clientes',
    '/produtos': 'Produtos',
    '/vendas': 'Vendas',
    '/estoque': 'Estoque',
  }[location.pathname] || 'Dashboard'

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.brand}>
          <div style={s.brandIcon}>N</div>
          <div>
            <p style={s.brandName}>Nexus Store</p>
            <p style={s.brandSub}>Sistema de Gestão</p>
          </div>
        </div>

        {/* Nav label */}
        <p style={s.navLabel}>MENU</p>

        {/* Nav items */}
        <nav style={s.nav}>
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {({ isActive }) => isActive && <span style={s.navDot} />}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={s.avatar}>{user?.nome?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={s.userName}>{user?.nome}</p>
              <p style={s.userRole}>Vendedor</p>
            </div>
            <button style={s.logoutIcon} onClick={handleLogout} title="Sair">
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={s.body}>
        {/* TOPBAR */}
        <header style={s.topbar}>
          <div>
            <h1 style={s.topbarTitle}>{pageTitle}</h1>
            <p style={s.topbarBread}>Nexus Store / {pageTitle}</p>
          </div>
          <div style={s.topbarRight}>
            <div style={s.topbarUser}>
              <span style={s.topbarAvatar}>{user?.nome?.charAt(0).toUpperCase()}</span>
              <span style={s.topbarName}>{user?.nome}</span>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main style={s.page}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const s = {
  root: { display: 'flex', minHeight: '100vh', background: '#F5F7FA' },

  sidebar: {
    width: 255, background: '#14532D', display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
  },

  brand: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandIcon: {
    width: 38, height: 38, background: '#16A34A', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  brandName: { color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.3 },
  brandSub: { color: 'rgba(255,255,255,0.45)', fontSize: 10, margin: 0, letterSpacing: '0.5px' },

  navLabel: {
    color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600,
    letterSpacing: '1.5px', padding: '20px 20px 8px',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
    fontSize: 13.5, fontWeight: 500, transition: 'all 0.15s', position: 'relative',
  },
  navActive: {
    background: 'rgba(34,197,94,0.18)', color: '#22C55E', fontWeight: 600,
    borderLeft: '3px solid #22C55E', paddingLeft: 9,
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  navDot: { width: 6, height: 6, background: '#22C55E', borderRadius: '50%', marginLeft: 'auto' },

  sidebarFooter: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)', borderRadius: 10,
  },
  avatar: {
    width: 34, height: 34, borderRadius: 8, background: '#16A34A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  userName: { color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 },
  logoutIcon: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer', fontSize: 18, padding: '2px 4px', borderRadius: 6,
    transition: 'color 0.15s', flexShrink: 0,
  },

  body: { marginLeft: 255, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: {
    background: '#fff', padding: '0 28px', height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  topbarTitle: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
  topbarBread: { fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  topbarUser: { display: 'flex', alignItems: 'center', gap: 8 },
  topbarAvatar: {
    width: 32, height: 32, background: '#16A34A', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff',
  },
  topbarName: { fontSize: 13, fontWeight: 500, color: '#374151' },

  page: { padding: '24px 28px', flex: 1 },
}