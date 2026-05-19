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
    } finally {
      setLoading(false)
    }
  }

  const focusInput = e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })
  const blurInput  = e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <span style={{ fontSize: 28 }}><img src="/green-beans.png" alt="Nexus Store" style={{ width: 32, height: 32 }} /></span>
          <h1 style={s.logoText}>Nexus Store</h1>
        </div>
        <p style={s.subtitle}>Crie sua conta</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={s.field}>
            <label style={s.label}>Nome</label>
            <input style={s.input} type="text" placeholder="Seu nome"
              value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
              onFocus={focusInput} onBlur={blurInput} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={focusInput} onBlur={blurInput} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Senha</label>
            <input style={s.input} type="password" placeholder="••••••••"
              value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })}
              onFocus={focusInput} onBlur={blurInput} required />
          </div>

          {erro && <p style={s.erro}>{erro}</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
            onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <Link to="/login" style={s.link}
          onMouseEnter={e => e.currentTarget.style.color = '#2F5F4A'}
          onMouseLeave={e => e.currentTarget.style.color = '#3B7C5F'}
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#F5F5F5', fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: '#FFFFFF', borderRadius: 12, padding: '40px 36px',
    width: '100%', maxWidth: 400, boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '1px solid #EFEFEF',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoText: { fontSize: 24, fontWeight: 600, color: '#333333', margin: 0, lineHeight: 1.3 },
  subtitle: { color: '#808080', fontSize: 14, margin: '0 0 28px', lineHeight: 1.5 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#333333' },
  input: {
    width: '100%', padding: '12px 16px', border: '1px solid #EFEFEF',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif", color: '#333333',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  erro: { color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: {
    width: '100%', height: 40, background: '#3B7C5F', color: '#FFFFFF',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 8, fontFamily: "'Inter', sans-serif",
    transition: 'background 0.15s ease-in-out',
  },
  link: { marginTop: 20, color: '#3B7C5F', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' },
}