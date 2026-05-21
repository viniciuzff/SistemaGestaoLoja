import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await axios.post('/api/login', form, { withCredentials: true })
      if (res.data.ok) { onLogin({ autenticado: true, nome: res.data.nome }); navigate('/') }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Email ou senha inválidos')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.brandIcon}>N</div>
          <h1 style={s.brandTitle}>Nexus Store</h1>
          <p style={s.brandDesc}>Sistema de Gestão Profissional</p>
          <div style={s.features}>
            {['Controle de estoque em tempo real', 'Gestão de clientes e vendas', 'Dashboard com métricas', 'Interface moderna e intuitiva'].map(f => (
              <div key={f} style={s.featureItem}>
                <span style={s.featureCheck}>✓</span>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={s.leftFooter}>© 2025 Nexus Store. Todos os direitos reservados.</p>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Bem-vindo de volta</h2>
            <p style={s.formSub}>Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="seu@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }}
                onBlur={e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }}
                required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Senha</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })}
                onFocus={e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }}
                onBlur={e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }}
                required />
            </div>

            {erro && (
              <div style={s.erroBox}>
                <span>⚠</span> {erro}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loading ? 0.8 : 1 }} type="submit" disabled={loading}
              onMouseEnter={e => e.currentTarget.style.background='#14532D'}
              onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span style={s.spinner} /> Entrando...
                </span>
              ) : 'Entrar no Sistema'}
            </button>
          </form>

          <p style={s.signupText}>
            Não tem conta?{' '}
            <Link to="/cadastro" style={s.signupLink}>Criar conta</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex' },
  left: {
    flex: 1, background: 'linear-gradient(160deg, #14532D 0%, #166534 60%, #15803D 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '48px', color: '#fff',
  },
  leftContent: {},
  brandIcon: {
    width: 52, height: 52, background: '#22C55E', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 20,
  },
  brandTitle: { fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 8px' },
  brandDesc: { fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: '0 0 40px' },
  features: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 22, height: 22, background: 'rgba(34,197,94,0.2)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: '#22C55E', flexShrink: 0, fontWeight: 700,
  },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  leftFooter: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },

  right: {
    width: 480, background: '#F5F7FA',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px',
  },
  formCard: {
    background: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  formSub: { fontSize: 13.5, color: '#6B7280', margin: 0 },
  form: {},
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 },
  input: {
    width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    color: '#111827', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  erroBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#DC2626', borderRadius: 8, padding: '10px 14px',
    fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
  },
  btn: {
    width: '100%', height: 44, background: '#16A34A', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 6, transition: 'background 0.15s',
  },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  signupText: { textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 },
  signupLink: { color: '#16A34A', fontWeight: 600, textDecoration: 'none' },
}