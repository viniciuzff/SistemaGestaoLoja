import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'

const navItems = [
  { to: '/',         label: 'Dashboard', icon: '', end: true },
  { to: '/clientes', label: 'Clientes',  icon: '' },
  { to: '/produtos', label: 'Produtos',  icon: '' },
  { to: '/vendas',   label: 'Vendas',    icon: '' },
  { to: '/estoque',  label: 'Estoque',   icon: '' },
]

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await axios.post('/api/logout', {}, { withCredentials: true })
    onLogout()
    navigate('/login')
  }

  return (
    <div style={s.container}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.logoWrap}>
          <span style={{ fontSize: 22 }}><img src="/green-beans.png" alt="StoreFlow" style={{ width: 32, height: 32 }} /></span>
          <span style={s.logoText}>Nexus Store</span>
        </div>

        <nav style={s.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...s.navItem,
                ...(isActive ? s.navItemActive : {}),
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active'))
                  e.currentTarget.style.background = 'rgba(59,124,95,0.2)'
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.fontWeight === '600')
                  e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.userInfo}>
            <div style={s.avatar}>
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={s.userName}>{user?.nome}</p>
              <p style={s.userRole}>Vendedor</p>
            </div>
          </div>
          <button style={s.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
             Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={s.main}>
        <header style={s.topbar}>
          <div>
            <p style={s.topbarSub}>Bem-vindo de volta,</p>
            <strong style={s.topbarName}>{user?.nome}</strong>
          </div>
        </header>

        <main style={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const s = {
  container: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Inter', sans-serif", background: '#F5F5F5',
  },
  sidebar: {
    width: 260, background: '#2F5F4A', color: '#FFFFFF',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', position: 'fixed',
    top: 0, left: 0, bottom: 0, zIndex: 100,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 8px', marginBottom: 32,
  },
  logoText: { fontSize: 18, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
    fontSize: 14, fontWeight: 400, lineHeight: 1.5,
    transition: 'all 0.2s ease-in-out',
  },
  navItemActive: {
    background: '#3B7C5F', color: '#FFFFFF', fontWeight: 600,
  },
  sidebarBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#3B7C5F', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 15, fontWeight: 700,
    color: '#FFFFFF', flexShrink: 0,
  },
  userName: { margin: 0, fontSize: 13, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.4 },
  userRole: { margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.75)', borderRadius: 8, padding: '9px 12px',
    cursor: 'pointer', fontSize: 13, textAlign: 'left',
    fontFamily: "'Inter', sans-serif", transition: 'background 0.2s ease-in-out',
  },
  main: { marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: {
    background: '#FFFFFF', padding: '0 24px', height: 60,
    display: 'flex', alignItems: 'center',
    borderBottom: '1px solid #EFEFEF',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
  },
  topbarSub: { margin: 0, fontSize: 12, color: '#808080', lineHeight: 1.4 },
  topbarName: { fontSize: 14, fontWeight: 600, color: '#333333', lineHeight: 1.5 },
  content: { padding: 24, flex: 1 },
}