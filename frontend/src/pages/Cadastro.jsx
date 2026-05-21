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

  const focus = e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.brandIcon}>N</div>
          <h1 style={s.brandTitle}>Nexus Store</h1>
          <p style={s.brandDesc}>Crie sua conta e comece a gerenciar sua loja de forma profissional.</p>
        </div>
        <p style={s.leftFooter}>© 2025 Nexus Store. Todos os direitos reservados.</p>
      </div>

      <div style={s.right}>
        <div style={s.formCard}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>Criar conta</h2>
            <p style={s.formSub}>Preencha os dados para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key:'nome',  label:'Nome completo', type:'text',     ph:'Seu nome' },
              { key:'email', label:'Email',          type:'email',    ph:'seu@email.com' },
              { key:'senha', label:'Senha',          type:'password', ph:'Mínimo 6 caracteres' },
            ].map(f => (
              <div key={f.key} style={s.field}>
                <label style={s.label}>{f.label}</label>
                <input style={s.input} type={f.type} placeholder={f.ph}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  onFocus={focus} onBlur={blur} required />
              </div>
            ))}

            {erro && (
              <div style={s.erroBox}><span>⚠</span> {erro}</div>
            )}

            <button style={{ ...s.btn, opacity: loading ? 0.8 : 1 }} type="submit" disabled={loading}
              onMouseEnter={e => e.currentTarget.style.background='#14532D'}
              onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
            >{loading ? 'Cadastrando...' : 'Criar Conta'}</button>
          </form>

          <p style={s.loginText}>
            Já tem conta?{' '}
            <Link to="/login" style={s.loginLink}>Fazer login</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex' },
  left: { flex: 1, background: 'linear-gradient(160deg, #14532D 0%, #166534 60%, #15803D 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', color: '#fff' },
  leftContent: {},
  brandIcon: { width: 52, height: 52, background: '#22C55E', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 20 },
  brandTitle: { fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 12px' },
  brandDesc: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 360 },
  leftFooter: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  right: { width: 480, background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' },
  formCard: { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  formSub: { fontSize: 13.5, color: '#6B7280', margin: 0 },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', transition: 'border-color 0.2s, box-shadow 0.2s' },
  erroBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  btn: { width: '100%', height: 44, background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 6, transition: 'background 0.15s' },
  loginText: { textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 },
  loginLink: { color: '#16A34A', fontWeight: 600, textDecoration: 'none' },
}