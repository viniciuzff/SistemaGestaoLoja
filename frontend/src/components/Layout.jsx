import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { LayoutDashboard, Package, Users, ShoppingCart, Warehouse, ArrowLeftRight, Settings, ThumbsUp, HelpCircle } from 'lucide-react'

const menuGroups = [
  {
    label: 'MENU',
    items: [
      { to: '/',              icon: <LayoutDashboard size={18}/>, label: 'Dashboard',      end: true },
      { to: '/produtos',      icon: <Package size={18}/>,         label: 'Produtos' },
      { to: '/clientes',      icon: <Users size={18}/>,           label: 'Clientes' },
    ]
  },
  {
    label: 'OPERAÇÃO',
    items: [
      { to: '/vendas',        icon: <ShoppingCart size={18}/>,    label: 'Vendas' },
      { to: '/estoque',       icon: <Warehouse size={18}/>,       label: 'Estoque' },
      { to: '/movimentacoes', icon: <ArrowLeftRight size={18}/>,  label: 'Movimentações' },
    ]
  },
  {
    label: 'FERRAMENTAS',
    items: [
      { to: '/perfil',        icon: <Settings size={18}/>,        label: 'Configurações' },
    ]
  }
]

export default function Layout({ user, onLogout, onUserUpdate }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await axios.post('/api/logout', {}, { withCredentials: true })
    onLogout()
    navigate('/login')
  }

  const pageTitle = {
    '/':              'Dashboard',
    '/clientes':      'Clientes',
    '/produtos':      'Produtos',
    '/vendas':        'Vendas',
    '/estoque':       'Estoque',
    '/perfil':        'Configurações',
    '/movimentacoes': 'Movimentações',
  }[location.pathname] || 'Dashboard'

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        {/* BRAND */}
        <div style={s.brand}>
          <div style={s.brandIcon}>N</div>
          <div>
            <p style={s.brandName}>Nexus Store</p>
            <p style={s.brandSub}>Sistema de Gestão</p>
          </div>
        </div>

        {/* NAV GROUPS */}
        <div style={s.nav}>
          {menuGroups.map(group => (
            <div key={group.label} style={s.group}>
              <p style={s.groupLabel}>{group.label}</p>
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  style={({ isActive }) => ({
                    ...s.navItem,
                    ...(isActive ? s.navActive : {})
                  })}
                >
                  <span style={s.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={s.sidebarFooter}>
          <div style={s.userCard}
            onClick={() => navigate('/perfil')}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
          >
            <div style={s.avatar}>{user?.nome?.charAt(0).toUpperCase()}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={s.userName}>{user?.nome}</p>
              <p style={s.userRole}>Ver perfil</p>
            </div>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>›</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >⇥ Sair</button>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={s.body}>
        <header style={s.topbar}>
          <div>
            <h1 style={s.topbarTitle}>{pageTitle}</h1>
            <p style={s.topbarBread}>Nexus Store / {pageTitle}</p>
          </div>
          <div style={s.topbarRight}>
            <div style={s.topbarUser}
              onClick={() => navigate('/perfil')}
              onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={s.topbarAvatar}>{user?.nome?.charAt(0).toUpperCase()}</div>
              <div>
                <p style={s.topbarName}>{user?.nome}</p>
                <p style={s.topbarSub}>Editar perfil</p>
              </div>
            </div>
          </div>
        </header>

        <main style={s.page}>
          <Outlet context={{ user, onUserUpdate }} />
        </main>
      </div>
    </div>
  )
}

const s = {
  root: { display:'flex', minHeight:'100vh', background:'#F5F7FA' },
  sidebar: { width:240, background:'#1a6b3a', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:200, boxShadow:'4px 0 20px rgba(0,0,0,0.15)' },
  brand: { display:'flex', alignItems:'center', gap:12, padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  brandIcon: { width:38, height:38, background:'#16A34A', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', flexShrink:0 },
  brandName: { color:'#fff', fontWeight:700, fontSize:15, margin:0, lineHeight:1.3 },
  brandSub: { color:'rgba(255,255,255,0.45)', fontSize:10, margin:0, letterSpacing:'0.5px' },
  nav: { flex:1, overflowY:'auto', padding:'12px 12px 0' },
  group: { marginBottom:24 },
  groupLabel: { color:'rgba(255,255,255,0.7)', fontSize:10, fontWeight:700, letterSpacing:'1.5px', padding:'0 8px', margin:'0 0 6px' },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, color:'#ffffff', textDecoration:'none', fontSize:13.5, fontWeight:500, transition:'all 0.15s', marginBottom:2 },
  navActive: { background:'#ffffff', color:'#14532D', fontWeight:700 },
  navIcon: { fontSize:16, width:20, textAlign:'center', flexShrink:0 },
  sidebarFooter: { padding:'12px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', gap:6 },
  userCard: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(255,255,255,0.06)', borderRadius:10, cursor:'pointer', transition:'background 0.15s' },
  avatar: { width:34, height:34, borderRadius:8, background:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 },
  userName: { color:'#fff', fontSize:13, fontWeight:600, margin:0, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  userRole: { color:'rgba(255,255,255,0.4)', fontSize:10, margin:0 },
  logoutBtn: { background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.65)', borderRadius:8, padding:'9px 12px', cursor:'pointer', fontSize:13, textAlign:'left', transition:'background 0.2s' },
  body: { marginLeft:240, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' },
  topbar: { background:'#fff', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', position:'sticky', top:0, zIndex:100 },
  topbarTitle: { fontSize:18, fontWeight:700, color:'#111827', margin:0 },
  topbarBread: { fontSize:12, color:'#9CA3AF', margin:'2px 0 0' },
  topbarRight: { display:'flex', alignItems:'center', gap:16 },
  topbarUser: { display:'flex', alignItems:'center', gap:10, padding:'6px 12px', borderRadius:10, cursor:'pointer', transition:'background 0.15s' },
  topbarAvatar: { width:34, height:34, background:'#16A34A', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' },
  topbarName: { fontSize:13, fontWeight:600, color:'#111827', margin:0, lineHeight:1.3 },
  topbarSub: { fontSize:11, color:'#9CA3AF', margin:0 },
  page: { padding:'24px 28px', flex:1 },
}