import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'

const api = cfg => axios({ withCredentials: true, ...cfg })

export default function Perfil() {
  const { user, onUserUpdate } = useOutletContext()

  const [formInfo, setFormInfo] = useState({ nome: user?.nome || '', email: user?.email || '' })
  const [formSenha, setFormSenha] = useState({ senha_atual: '', nova_senha: '', confirmar: '' })
  const [msgInfo, setMsgInfo]   = useState(null)
  const [msgSenha, setMsgSenha] = useState(null)
  const [loadInfo, setLoadInfo]   = useState(false)
  const [loadSenha, setLoadSenha] = useState(false)

  const focus = e => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }

  async function salvarInfo(e) {
    e.preventDefault()
    setLoadInfo(true)
    setMsgInfo(null)
    try {
      const res = await api({ method: 'put', url: '/api/perfil', data: formInfo })
      if (res.data.ok) {
        setMsgInfo({ tipo: 'sucesso', texto: 'Informações atualizadas com sucesso!' })
        if (onUserUpdate) onUserUpdate({ ...user, nome: formInfo.nome })
      }
    } catch (err) {
      setMsgInfo({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro ao atualizar informações' })
    } finally { setLoadInfo(false) }
  }

  async function salvarSenha(e) {
    e.preventDefault()
    setMsgSenha(null)
    if (formSenha.nova_senha !== formSenha.confirmar) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha e a confirmação não coincidem' })
      return
    }
    if (formSenha.nova_senha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres' })
      return
    }
    setLoadSenha(true)
    try {
      const res = await api({ method: 'put', url: '/api/perfil/senha', data: formSenha })
      if (res.data.ok) {
        setMsgSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
        setFormSenha({ senha_atual: '', nova_senha: '', confirmar: '' })
      }
    } catch (err) {
      setMsgSenha({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro ao alterar senha' })
    } finally { setLoadSenha(false) }
  }

  return (
    <div style={s.page}>

      {/* HEADER CARD */}
      <div style={s.headerCard}>
        <div style={s.headerAvatar}>{user?.nome?.charAt(0).toUpperCase()}</div>
        <div>
          <h2 style={s.headerName}>{user?.nome}</h2>
          <p style={s.headerRole}>Vendedor · Nexus Store</p>
        </div>
      </div>

      <div style={s.grid}>

        {/* INFORMAÇÕES PESSOAIS */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardIconWrap}>👤</div>
            <div>
              <h3 style={s.cardTitle}>Informações Pessoais</h3>
              <p style={s.cardSub}>Atualize seu nome e email de acesso</p>
            </div>
          </div>

          <form onSubmit={salvarInfo}>
            <div style={s.field}>
              <label style={s.label}>Nome completo</label>
              <input style={s.input} type="text" placeholder="Seu nome"
                value={formInfo.nome}
                onChange={e => setFormInfo({ ...formInfo, nome: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="seu@email.com"
                value={formInfo.email}
                onChange={e => setFormInfo({ ...formInfo, email: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>

            {msgInfo && (
              <div style={{ ...s.msg, ...(msgInfo.tipo === 'sucesso' ? s.msgSucesso : s.msgErro) }}>
                {msgInfo.tipo === 'sucesso' ? '✅' : '⚠️'} {msgInfo.texto}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loadInfo ? 0.8 : 1 }}
              type="submit" disabled={loadInfo}
              onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
              onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            >{loadInfo ? 'Salvando...' : 'Salvar Informações'}</button>
          </form>
        </div>

        {/* ALTERAR SENHA */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardIconWrap}>🔒</div>
            <div>
              <h3 style={s.cardTitle}>Alterar Senha</h3>
              <p style={s.cardSub}>Mantenha sua conta segura</p>
            </div>
          </div>

          <form onSubmit={salvarSenha}>
            <div style={s.field}>
              <label style={s.label}>Senha atual</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={formSenha.senha_atual}
                onChange={e => setFormSenha({ ...formSenha, senha_atual: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nova senha</label>
              <input style={s.input} type="password" placeholder="Mínimo 6 caracteres"
                value={formSenha.nova_senha}
                onChange={e => setFormSenha({ ...formSenha, nova_senha: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmar nova senha</label>
              <input style={s.input} type="password" placeholder="Repita a nova senha"
                value={formSenha.confirmar}
                onChange={e => setFormSenha({ ...formSenha, confirmar: e.target.value })}
                onFocus={focus} onBlur={blur} required />
            </div>

            {msgSenha && (
              <div style={{ ...s.msg, ...(msgSenha.tipo === 'sucesso' ? s.msgSucesso : s.msgErro) }}>
                {msgSenha.tipo === 'sucesso' ? '✅' : '⚠️'} {msgSenha.texto}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loadSenha ? 0.8 : 1 }}
              type="submit" disabled={loadSenha}
              onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
              onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            >{loadSenha ? 'Alterando...' : 'Alterar Senha'}</button>
          </form>
        </div>

      </div>
    </div>
  )
}

const s = {
  page: {},
  headerCard: {
    background: 'linear-gradient(135deg, #14532D, #16A34A)',
    borderRadius: 14, padding: '28px 32px',
    display: 'flex', alignItems: 'center', gap: 20,
    marginBottom: 24, boxShadow: '0 4px 20px rgba(22,163,74,0.25)',
  },
  headerAvatar: {
    width: 64, height: 64, borderRadius: 16,
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  headerName: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' },
  headerRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#fff', borderRadius: 14, padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #F3F4F6' },
  cardIconWrap: { fontSize: 24 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 3px' },
  cardSub: { fontSize: 12.5, color: '#9CA3AF', margin: 0 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#FAFAFA', transition: 'border-color 0.2s, box-shadow 0.2s' },
  msg: { borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  msgSucesso: { background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#15803D' },
  msgErro: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' },
  btn: { width: '100%', height: 42, background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' },
}