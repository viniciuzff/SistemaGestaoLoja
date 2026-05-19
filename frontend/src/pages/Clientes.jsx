import { useState, useEffect } from 'react'
import axios from 'axios'

const api = (cfg) => axios({ withCredentials: true, ...cfg })
const formVazio = { nome: '', email: '', telefone: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(formVazio)

  const carregar = () => api({ url: '/api/clientes' }).then(r => setClientes(r.data))

  useEffect(() => { carregar() }, [])

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirNovo() { setEditando(null); setForm(formVazio); setModal(true) }
  function abrirEditar(c) {
    setEditando(c)
    setForm({ nome: c.nome, email: c.email, telefone: c.telefone })
    setModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    if (editando) await api({ method: 'put', url: `/api/clientes/${editando.id}`, data: form })
    else await api({ method: 'post', url: '/api/clientes', data: form })
    setModal(false)
    carregar()
  }

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    await api({ method: 'delete', url: `/api/clientes/${id}` })
    carregar()
  }

  const focusInput = e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })
  const blurInput  = e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Clientes</h2>
          <p style={s.pageSub}>{clientes.length} registrados</p>
        </div>
        <button style={s.btnPrimary} onClick={abrirNovo}
          onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
        >
          + Novo Cliente
        </button>
      </div>

      {/* BUSCA */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input style={s.searchInput} placeholder="Buscar cliente..."
          value={busca} onChange={e => setBusca(e.target.value)}
          onFocus={e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })}
          onBlur={e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })}
        />
      </div>

      {/* TABELA */}
      <div style={s.tableBox}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Nome', 'Email', 'Telefone', 'Ações'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0
              ? <tr><td colSpan={4} style={s.empty}>Nenhum cliente encontrado.</td></tr>
              : filtrados.map(c => (
                <tr key={c.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={s.td}><strong style={{ color: '#333333' }}>{c.nome}</strong></td>
                  <td style={s.td}>{c.email}</td>
                  <td style={s.td}>{c.telefone}</td>
                  <td style={s.td}>
                    <button style={s.btnEdit} onClick={() => abrirEditar(c)}
                      onMouseEnter={e => e.currentTarget.style.background = '#E8F5F1'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >✏️ Editar</button>
                    <button style={s.btnDel} onClick={() => excluir(c.id)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >🗑️ Excluir</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{editando ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}
                onMouseEnter={e => e.currentTarget.style.color = '#333333'}
                onMouseLeave={e => e.currentTarget.style.color = '#808080'}
              >✕</button>
            </div>
            <form onSubmit={salvar} style={s.form}>
              {[
                { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Nome completo' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@exemplo.com' },
                { name: 'telefone', label: 'Telefone', type: 'text', placeholder: '(00) 00000-0000' },
              ].map(f => (
                <div key={f.name} style={s.field}>
                  <label style={s.label}>{f.label}</label>
                  <input style={s.input} type={f.type} placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                    required={f.name === 'nome'}
                  />
                </div>
              ))}
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E8F5F1'; e.currentTarget.style.color = '#2F5F4A' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#3B7C5F' }}
                >Cancelar</button>
                <button type="submit" style={s.btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
                >Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { fontFamily: "'Inter', sans-serif" },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  pageTitle: { fontSize: 32, fontWeight: 700, color: '#333333', margin: 0, lineHeight: 1.3 },
  pageSub: { color: '#808080', fontSize: 14, margin: '4px 0 0', lineHeight: 1.5 },
  btnPrimary: {
    height: 40, padding: '0 20px', background: '#3B7C5F', color: '#FFFFFF',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    transition: 'background 0.15s ease-in-out',
  },
  searchWrap: {
    position: 'relative', marginBottom: 16,
    display: 'flex', alignItems: 'center',
  },
  searchIcon: { position: 'absolute', left: 14, fontSize: 14 },
  searchInput: {
    width: '100%', padding: '12px 16px 12px 40px',
    border: '1px solid #EFEFEF', borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif", color: '#333333',
    background: '#FFFFFF', transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  tableBox: { background: '#FFFFFF', borderRadius: 12, boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #EFEFEF' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#E8F5F1' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#2F5F4A', fontWeight: 600, borderBottom: '1px solid #EFEFEF' },
  td: { padding: '14px 16px', fontSize: 14, color: '#808080', borderBottom: '1px solid #EFEFEF', transition: 'background 0.15s' },
  empty: { padding: '32px', textAlign: 'center', color: '#808080', fontSize: 14 },
  btnEdit: { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#3B7C5F', fontWeight: 600, marginRight: 4, transition: 'background 0.15s' },
  btnDel:  { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#EF4444', fontWeight: 600, transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#FFFFFF', borderRadius: 12, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 600, color: '#333333', margin: 0, lineHeight: 1.3 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#808080', transition: 'color 0.15s' },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#333333' },
  input: { width: '100%', padding: '12px 16px', border: '1px solid #EFEFEF', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", color: '#333333', transition: 'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  btnSecondary: { height: 40, padding: '0 20px', background: '#FFFFFF', color: '#3B7C5F', border: '1px solid #3B7C5F', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' },
}