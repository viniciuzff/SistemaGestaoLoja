import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await axios.post('/api/cadastro', form, { withCredentials: true })
      if (res.data.ok) navigate('/login')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar')
    } finally { setLoading(false) }
  }

  const focus = e => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.bgOverlay} />
      <div style={{ ...s.circle, width: 400, height: 400, top: -100, left: -100 }} />
      <div style={{ ...s.circle, width: 300, height: 300, bottom: -80, right: -60, opacity: 0.4 }} />
      <div style={{ ...s.circle, width: 180, height: 180, top: '40%', right: '15%', opacity: 0.25 }} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>N</div>
          <div>
            <h1 style={s.logoName}>Nexus Store</h1>
            <p style={s.logoTag}>Sistema de Gestão</p>
          </div>
        </div>

        {/* Frase de impacto */}
        <div style={s.impact}>
          <h2 style={s.impactTitle}>Crie sua conta 🚀</h2>
          <p style={s.impactSub}>Comece agora a gerenciar sua loja de forma profissional.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {[
            { key: 'nome',  label: 'Nome completo', type: 'text',     ph: 'Ex: João Silva' },
            { key: 'email', label: 'Email',          type: 'email',    ph: 'seu@email.com' },
            { key: 'senha', label: 'Senha',          type: 'password', ph: 'Mínimo 6 caracteres' },
          ].map(f => (
            <div key={f.key} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input style={s.input} type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>
          ))}

          {erro && (
            <div style={s.erroBox}>
              <span>⚠️</span> {erro}
            </div>
          )}

          <button
            style={{ ...s.btn, opacity: loading ? 0.8 : 1 }}
            type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
          >
            {loading ? 'Criando conta...' : 'Criar Conta →'}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>ou</span>
          <div style={s.dividerLine} />
        </div>

        <p style={s.loginText}>
          Já tem conta?{' '}
          <Link to="/login" style={s.loginLink}>Fazer login</Link>
        </p>

        <p style={s.footer}>© 2025 Nexus Store · Todos os direitos reservados</p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #052e16 0%, #14532D 40%, #166534 70%, #15803D 100%)',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34,197,94,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(22,163,74,0.12) 0%, transparent 40%),
                      radial-gradient(circle at 60% 80%, rgba(5,46,22,0.3) 0%, transparent 50%)`,
  },
  bgOverlay: {
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322C55E' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  circle: {
    position: 'absolute', borderRadius: '50%',
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.15)',
    zIndex: 0,
  },
  card: {
    position: 'relative', zIndex: 10,
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20, padding: '36px 40px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
    animation: 'fadeUp 0.5s ease',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 24, paddingBottom: 20,
    borderBottom: '1px solid #F3F4F6',
  },
  logoIcon: {
    width: 44, height: 44, background: 'linear-gradient(135deg, #16A34A, #22C55E)',
    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, color: '#fff',
    boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
  },
  logoName: { fontSize: 17, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 },
  logoTag:  { fontSize: 11, color: '#9CA3AF', margin: 0, fontWeight: 500 },
  impact: { marginBottom: 24 },
  impactTitle: { fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 },
  impactSub:   { fontSize: 13.5, color: '#6B7280', margin: 0, lineHeight: 1.6 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    color: '#111827', background: '#FAFAFA',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  erroBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#DC2626', borderRadius: 8, padding: '10px 14px',
    fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
  },
  btn: {
    width: '100%', height: 44, background: '#16A34A', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 4, transition: 'background 0.15s',
    boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' },
  dividerLine: { flex: 1, height: 1, background: '#E5E7EB' },
  dividerText: { fontSize: 12, color: '#9CA3AF', fontWeight: 500 },
  loginText: { textAlign: 'center', fontSize: 13.5, color: '#6B7280' },
  loginLink: { color: '#16A34A', fontWeight: 600, textDecoration: 'none' },
  footer: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 20 },
}