import { useState, useEffect } from 'react'
import axios from 'axios'

const api = cfg => axios({ withCredentials: true, ...cfg })
const categorias = ['Vestuário','Calçados','Acessórios','Eletrônicos','Outros']

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [filtro, setFiltro]     = useState('todos')
  const [busca, setBusca]       = useState('')
  const [modal, setModal]       = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState({})
  const [loading, setLoading]   = useState(false)

  const carregar = () => api({ url: '/api/estoque' }).then(r => setProdutos(r.data))
  useEffect(() => { carregar() }, [])

  const filtrados = produtos
    .filter(p => filtro === 'todos' ? true : filtro === 'baixo' ? p.baixo : !p.baixo)
    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))

  const totalBaixo = produtos.filter(p => p.baixo).length
  const totalOk    = produtos.filter(p => !p.baixo).length

  function abrirEditar(p) {
    setEditando(p)
    setForm({
      nome: p.nome, categoria: p.categoria,
      quantidade: p.quantidade, estoque_minimo: p.estoque_minimo,
      status: p.status,
    })
    setModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api({ method: 'put', url: `/api/produtos/${editando.id}`, data: form })
      setModal(false)
      carregar()
    } finally { setLoading(false) }
  }

  async function excluir(id, nome) {
    if (!confirm(`Excluir o produto "${nome}"?`)) return
    await api({ method: 'delete', url: `/api/produtos/${id}` })
    carregar()
  }

  const focus = e => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }

  return (
    <div>
      {/* SUMMARY CARDS */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <span style={{ fontSize: 22 }}></span>
          <div>
            <p style={s.summaryLabel}>Total de Produtos</p>
            <p style={s.summaryValue}>{produtos.length}</p>
          </div>
        </div>
        <div style={{ ...s.summaryCard, borderLeft: '3px solid #22C55E' }}>
          <span style={{ fontSize: 22 }}></span>
          <div>
            <p style={s.summaryLabel}>Estoque Normal</p>
            <p style={{ ...s.summaryValue, color: '#16A34A' }}>{totalOk}</p>
          </div>
        </div>
        <div style={{ ...s.summaryCard, borderLeft: '3px solid #EF4444' }}>
          <span style={{ fontSize: 22 }}></span>
          <div>
            <p style={s.summaryLabel}>Estoque Baixo</p>
            <p style={{ ...s.summaryValue, color: '#DC2626' }}>{totalBaixo}</p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={s.controls}>
        <div style={s.filtros}>
          {[
            { v: 'todos', label: `Todos (${produtos.length})` },
            { v: 'baixo', label: ` Baixo (${totalBaixo})` },
            { v: 'ok',    label: ` Normal (${totalOk})` },
          ].map(f => (
            <button key={f.v}
              style={{ ...s.filtroBtn, ...(filtro === f.v ? s.filtroBtnAtivo : {}) }}
              onClick={() => setFiltro(f.v)}
            >{f.label}</button>
          ))}
        </div>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}></span>
          <input style={s.searchInput} placeholder="Buscar produto..."
            value={busca} onChange={e => setBusca(e.target.value)}
            onFocus={focus} onBlur={blur} />
        </div>
      </div>

      {/* TABLE */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Produto','Categoria','Quantidade / Progresso','Mínimo','Status','Situação','Ações'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0
              ? <tr><td colSpan={7} style={s.empty}>Nenhum produto encontrado.</td></tr>
              : filtrados.map((p, i) => {
                const pct = Math.min(100, Math.round((p.quantidade / Math.max(p.estoque_minimo * 3 || 1, 1)) * 100))
                return (
                  <tr key={p.id}
                    style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'}
                  >
                    <td style={s.td}><strong style={{ color: '#111827' }}>{p.nome}</strong></td>
                    <td style={s.td}><span style={s.catBadge}>{p.categoria}</span></td>
                    <td style={{ ...s.td, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, color: p.baixo ? '#DC2626' : '#16A34A', minWidth: 28, fontSize: 14 }}>
                          {p.quantidade}
                        </span>
                        <div style={s.barTrack}>
                          <div style={{ ...s.barFill, width: `${pct}%`, background: p.baixo ? '#EF4444' : '#22C55E' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#9CA3AF', minWidth: 30 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#6B7280' }}>{p.estoque_minimo} un.</td>
                    <td style={s.td}>
                      <span style={{
                        background: p.status === 'Ativo' ? '#DCFCE7' : '#F3F4F6',
                        color: p.status === 'Ativo' ? '#15803D' : '#6B7280',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        background: p.baixo ? '#FEE2E2' : '#DCFCE7',
                        color: p.baixo ? '#DC2626' : '#15803D',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      }}>
                        {p.baixo ? ' Baixo' : ' Normal'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.btnEdit} onClick={() => abrirEditar(p)}> Editar</button>
                        <button style={s.btnDel}  onClick={() => excluir(p.id, p.nome)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h3 style={s.modalTitle}> Editar Produto</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar}>
              <div style={s.field}>
                <label style={s.label}>Nome</label>
                <input style={s.input} value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  onFocus={focus} onBlur={blur} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Categoria</label>
                <select style={s.input} value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  onFocus={focus} onBlur={blur}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Quantidade em Estoque</label>
                  <input style={s.input} type="number" value={form.quantidade}
                    onChange={e => setForm({ ...form, quantidade: e.target.value })}
                    onFocus={focus} onBlur={blur} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Estoque Mínimo</label>
                  <input style={s.input} type="number" value={form.estoque_minimo}
                    onChange={e => setForm({ ...form, estoque_minimo: e.target.value })}
                    onFocus={focus} onBlur={blur} />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  onFocus={focus} onBlur={blur}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit"
                  style={{ ...s.btnPrimary, opacity: loading ? 0.8 : 1 }}
                  disabled={loading}
                  onMouseEnter={e => e.currentTarget.style.background = '#14532D'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
                >{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  summaryRow: { display: 'flex', gap: 12, marginBottom: 20 },
  summaryCard: { background: '#fff', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', flex: 1, borderLeft: '3px solid #E5E7EB' },
  summaryLabel: { fontSize: 12, color: '#6B7280', margin: '0 0 3px', fontWeight: 500 },
  summaryValue: { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  filtros: { display: 'flex', gap: 6 },
  filtroBtn: { height: 36, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#6B7280', transition: 'all 0.15s' },
  filtroBtnAtivo: { background: '#16A34A', color: '#fff', borderColor: '#16A34A', fontWeight: 600 },
  searchWrap: { position: 'relative', minWidth: 220 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box', color: '#111827', transition: 'border-color 0.2s, box-shadow 0.2s', background: '#fff' },
  tableWrap: { background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F9FAFB' },
  th: { textAlign: 'left', padding: '11px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB' },
  td: { padding: '12px 16px', fontSize: 13.5, color: '#374151', borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' },
  empty: { textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: 14 },
  catBadge: { background: '#F3F4F6', color: '#6B7280', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  barTrack: { flex: 1, background: '#F3F4F6', borderRadius: 6, height: 7, minWidth: 80, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 6, transition: 'width 0.4s ease' },
  actions: { display: 'flex', gap: 6 },
  btnEdit: { padding: '5px 12px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnDel:  { padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', transition: 'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 },
  btnPrimary: { height: 40, padding: '0 20px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' },
  btnSecondary: { height: 40, padding: '0 18px', background: '#fff', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' },
}