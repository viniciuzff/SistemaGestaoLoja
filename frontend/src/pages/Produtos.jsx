import { useState, useEffect } from 'react'
import axios from 'axios'

const api = (cfg) => axios({ withCredentials: true, ...cfg })
const formVazio = { nome: '', categoria: '', preco_venda: '', preco_custo: '', quantidade: '', estoque_minimo: '', status: 'Ativo' }
const categorias = ['Vestuário', 'Calçados', 'Acessórios', 'Eletrônicos', 'Outros']

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(formVazio)

  const carregar = (b = '') =>
    api({ url: '/api/produtos', params: { busca: b } }).then(r => setProdutos(r.data))

  useEffect(() => { carregar() }, [])

  function abrirNovo() { setEditando(null); setForm(formVazio); setModal(true) }
  function abrirEditar(p) {
    setEditando(p)
    setForm({ nome: p.nome, categoria: p.categoria, preco_venda: p.preco_venda, preco_custo: p.preco_custo, quantidade: p.quantidade, estoque_minimo: p.estoque_minimo, status: p.status })
    setModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    if (editando) await api({ method: 'put', url: `/api/produtos/${editando.id}`, data: form })
    else await api({ method: 'post', url: '/api/produtos', data: form })
    setModal(false)
    carregar(busca)
  }

  async function excluir(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    await api({ method: 'delete', url: `/api/produtos/${id}` })
    carregar(busca)
  }

  const focusInput = e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })
  const blurInput  = e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Produtos</h2>
          <p style={s.pageSub}>{produtos.length} registrados</p>
        </div>
        <button style={s.btnPrimary} onClick={abrirNovo}
          onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
        >+ Novo Produto</button>
      </div>

      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input style={s.searchInput} placeholder="Buscar produto..."
          value={busca}
          onChange={e => { setBusca(e.target.value); carregar(e.target.value) }}
          onFocus={e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })}
          onBlur={e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })}
        />
      </div>

      <div style={s.tableBox}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Nome', 'Categoria', 'Preço', 'Quantidade', 'Status', 'Ações'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0
              ? <tr><td colSpan={6} style={s.empty}>Nenhum produto encontrado.</td></tr>
              : produtos.map(p => {
                const baixo = (p.quantidade || 0) <= (p.estoque_minimo || 0)
                return (
                  <tr key={p.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td}><strong style={{ color: '#333333' }}>{p.nome}</strong></td>
                    <td style={s.td}>{p.categoria}</td>
                    <td style={s.td}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                    <td style={s.td}>
                      <span style={{ color: baixo ? '#EF4444' : '#22C55E', fontWeight: 600 }}>
                        {p.quantidade} {baixo && '⚠️'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: p.status === 'Ativo' ? '#22C55E' : '#808080',
                        color: '#FFFFFF',
                      }}>{p.status}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnEdit} onClick={() => abrirEditar(p)}
                        onMouseEnter={e => e.currentTarget.style.background = '#E8F5F1'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >✏️ Editar</button>
                      <button style={s.btnDel} onClick={() => excluir(p.id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >🗑️ Excluir</button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{editando ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Nome</label>
                <input style={s.input} placeholder="Nome do produto"
                  value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Categoria</label>
                <select style={s.input} value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Preço de Venda</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0,00"
                    value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Preço de Custo</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0,00"
                    value={form.preco_custo} onChange={e => setForm({ ...form, preco_custo: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Quantidade</label>
                  <input style={s.input} type="number" placeholder="0"
                    value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Estoque Mínimo</label>
                  <input style={s.input} type="number" placeholder="0"
                    value={form.estoque_minimo} onChange={e => setForm({ ...form, estoque_minimo: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
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
  btnPrimary: { height: 40, padding: '0 20px', background: '#3B7C5F', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s' },
  searchWrap: { position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 14 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #EFEFEF', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", color: '#333333', background: '#FFFFFF', transition: 'border-color 0.2s, box-shadow 0.2s' },
  tableBox: { background: '#FFFFFF', borderRadius: 12, boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #EFEFEF' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#E8F5F1' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#2F5F4A', fontWeight: 600, borderBottom: '1px solid #EFEFEF' },
  td: { padding: '14px 16px', fontSize: 14, color: '#808080', borderBottom: '1px solid #EFEFEF', transition: 'background 0.15s' },
  empty: { padding: '32px', textAlign: 'center', color: '#808080', fontSize: 14 },
  btnEdit: { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#3B7C5F', fontWeight: 600, marginRight: 4, transition: 'background 0.15s' },
  btnDel:  { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#EF4444', fontWeight: 600, transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#FFFFFF', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0px 8px 24px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 600, color: '#333333', margin: 0, lineHeight: 1.3 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#808080' },
  form: { display: 'flex', flexDirection: 'column' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#333333' },
  input: { width: '100%', padding: '12px 16px', border: '1px solid #EFEFEF', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", color: '#333333', transition: 'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  btnSecondary: { height: 40, padding: '0 20px', background: '#FFFFFF', color: '#3B7C5F', border: '1px solid #3B7C5F', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
}