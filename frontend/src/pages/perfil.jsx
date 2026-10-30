import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'
import { User, Lock, Eye, EyeOff, Mail, ShieldCheck, Check, X } from 'lucide-react'

const api = cfg => axios({ withCredentials: true, ...cfg })

function forcaSenha(senha) {
  let pontos = 0
  if (senha.length >= 6) pontos++
  if (senha.length >= 10) pontos++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  if (!senha) return { nivel: 0, label: '', cor: '#E5E7EB' }
  if (pontos <= 2) return { nivel: 1, label: 'Fraca', cor: '#DC2626' }
  if (pontos <= 3) return { nivel: 2, label: 'Média', cor: '#F59E0B' }
  return { nivel: 3, label: 'Forte', cor: '#16A34A' }
}

function CampoSenha({ label, value, onChange, placeholder, focus, blur }) {
  const [ver, setVer] = useState(false)
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          style={{ ...s.input, paddingRight: 44 }}
          type={ver ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={focus} onBlur={blur}
          required
        />
        <button type="button" style={s.eyeBtn} onClick={() => setVer(!ver)} tabIndex={-1}>
          {ver ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  )
}

export default function Perfil() {
  const { user, onUserUpdate } = useOutletContext()

  const [aba, setAba]             = useState('dados')
  const [formInfo, setFormInfo]   = useState({ nome: user?.nome || '', email: user?.email || '' })
  const [formSenha, setFormSenha] = useState({ senha_atual: '', nova_senha: '', confirmar: '' })
  const [msgInfo, setMsgInfo]     = useState(null)
  const [msgSenha, setMsgSenha]   = useState(null)
  const [loadInfo, setLoadInfo]   = useState(false)
  const [loadSenha, setLoadSenha] = useState(false)

  const focus = e => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background = '#fff' }
  const blur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFAFA' }

  const forca = forcaSenha(formSenha.nova_senha)
  const confirmando = formSenha.confirmar.length > 0
  const senhasIguais = formSenha.nova_senha === formSenha.confirmar

  async function salvarInfo(e) {
    e.preventDefault()
    setLoadInfo(true); setMsgInfo(null)
    try {
      const res = await api({ method: 'put', url: '/api/perfil', data: formInfo })
      if (res.data.ok) {
        setMsgInfo({ tipo: 'sucesso', texto: 'Informações atualizadas com sucesso!' })
        if (onUserUpdate) onUserUpdate({ ...user, nome: formInfo.nome, email: formInfo.email })
      }
    } catch (err) {
      setMsgInfo({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro ao atualizar informações' })
    } finally { setLoadInfo(false) }
  }

  async function salvarSenha(e) {
    e.preventDefault()
    setMsgSenha(null)
    if (formSenha.nova_senha !== formSenha.confirmar) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha e a confirmação não coincidem' }); return
    }
    if (formSenha.nova_senha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres' }); return
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

  const abas = [
    { key: 'dados',      label: 'Dados pessoais', icon: <User size={16} /> },
    { key: 'seguranca',  label: 'Segurança',      icon: <ShieldCheck size={16} /> },
  ]

  return (
    <div style={{ maxWidth: 640 }}>

      {/* HEADER */}
      <div style={s.headerCard}>
        <div style={s.headerAvatar}>{user?.nome?.charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <h2 style={s.headerName}>{user?.nome}</h2>
          <p style={s.headerRole}><Mail size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />{user?.email || 'Vendedor · Nexus Store'}</p>
        </div>
      </div>

      {/* ABAS */}
      <div style={s.tabs}>
        {abas.map(a => (
          <button key={a.key}
            style={{ ...s.tab, ...(aba === a.key ? s.tabAtiva : {}) }}
            onClick={() => setAba(a.key)}
          >{a.icon}{a.label}</button>
        ))}
      </div>

      {/* ABA: DADOS */}
      {aba === 'dados' && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardIconWrap}><User size={20} /></div>
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
                {msgInfo.tipo === 'sucesso' ? <Check size={16} /> : <X size={16} />} {msgInfo.texto}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loadInfo ? 0.8 : 1 }} type="submit" disabled={loadInfo}
              onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
              onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            >{loadInfo ? 'Salvando...' : 'Salvar informações'}</button>
          </form>
        </div>
      )}

      {/* ABA: SEGURANÇA */}
      {aba === 'seguranca' && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardIconWrap}><Lock size={20} /></div>
            <div>
              <h3 style={s.cardTitle}>Alterar Senha</h3>
              <p style={s.cardSub}>Mantenha sua conta segura</p>
            </div>
          </div>

          <form onSubmit={salvarSenha}>
            <CampoSenha label="Senha atual" placeholder="••••••••"
              value={formSenha.senha_atual}
              onChange={e => setFormSenha({ ...formSenha, senha_atual: e.target.value })}
              focus={focus} blur={blur} />

            <CampoSenha label="Nova senha" placeholder="Mínimo 6 caracteres"
              value={formSenha.nova_senha}
              onChange={e => setFormSenha({ ...formSenha, nova_senha: e.target.value })}
              focus={focus} blur={blur} />

            {formSenha.nova_senha && (
              <div style={{ marginTop: -6, marginBottom: 16 }}>
                <div style={s.forcaTrilho}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ ...s.forcaBarra, background: forca.nivel >= n ? forca.cor : '#E5E7EB' }} />
                  ))}
                </div>
                <p style={{ ...s.forcaTexto, color: forca.cor }}>Senha {forca.label.toLowerCase()}</p>
              </div>
            )}

            <CampoSenha label="Confirmar nova senha" placeholder="Repita a nova senha"
              value={formSenha.confirmar}
              onChange={e => setFormSenha({ ...formSenha, confirmar: e.target.value })}
              focus={focus} blur={blur} />

            {confirmando && (
              <p style={{ ...s.forcaTexto, marginTop: -8, marginBottom: 16, color: senhasIguais ? '#16A34A' : '#DC2626' }}>
                {senhasIguais ? '✓ As senhas coincidem' : '✕ As senhas não coincidem'}
              </p>
            )}

            {msgSenha && (
              <div style={{ ...s.msg, ...(msgSenha.tipo === 'sucesso' ? s.msgSucesso : s.msgErro) }}>
                {msgSenha.tipo === 'sucesso' ? <Check size={16} /> : <X size={16} />} {msgSenha.texto}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loadSenha ? 0.8 : 1 }} type="submit" disabled={loadSenha}
              onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
              onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            >{loadSenha ? 'Alterando...' : 'Alterar senha'}</button>
          </form>
        </div>
      )}
    </div>
  )
}

const s = {
  headerCard: { background: 'linear-gradient(135deg, #14532D, #1a6b3a)', borderRadius: 14, padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, boxShadow: '0 4px 20px rgba(22,163,74,0.22)' },
  headerAvatar: { width: 60, height: 60, borderRadius: 16, background: '#fff', color: '#14532D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 },
  headerName: { fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 4px' },
  headerRole: { fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  tabs: { display: 'flex', gap: 6, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 5, marginBottom: 16 },
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', background: 'transparent', color: '#6B7280', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  tabAtiva: { background: '#1a6b3a', color: '#fff' },

  card: { background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #F3F4F6' },
  cardIconWrap: { width: 42, height: 42, borderRadius: 10, background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 3px' },
  cardSub: { fontSize: 12.5, color: '#9CA3AF', margin: 0 },

  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#FAFAFA', transition: 'border-color 0.2s, box-shadow 0.2s' },
  eyeBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 6, display: 'flex' },

  forcaTrilho: { display: 'flex', gap: 5, marginBottom: 6 },
  forcaBarra: { flex: 1, height: 5, borderRadius: 4, transition: 'background 0.2s' },
  forcaTexto: { fontSize: 12, fontWeight: 600, margin: 0 },

  msg: { borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  msgSucesso: { background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#15803D' },
  msgErro: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' },
  btn: { width: '100%', height: 44, background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' },
}