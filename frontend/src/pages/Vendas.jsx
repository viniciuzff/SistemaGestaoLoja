import { useState, useEffect } from 'react'
import axios from 'axios'

const api = (cfg) => axios({ withCredentials: true, ...cfg })
const formVazio = { cliente: '', produto_id: '', quantidade: 1, pagamento: 'Dinheiro', status: 'Concluída' }

function StatusBadge({ status }) {
  const map = {
    'Concluída': { bg: '#22C55E', color: '#FFFFFF' },
    'Pendente':  { bg: '#EAB308', color: '#000000' },
    'Cancelada': { bg: '#EF4444', color: '#FFFFFF' },
  }
  const st = map[status] || { bg: '#EFEFEF', color: '#333333' }
  return (
    <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  )
}

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(formVazio)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  const carregar = () => Promise.all([
    api({ url: '/api/vendas' }).then(r => setVendas(r.data)),
    api({ url: '/api/clientes' }).then(r => setClientes(r.data)),
    api({ url: '/api/produtos', params: { ativos: true } }).then(r => setProdutos(r.data)),
  ])

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    try {
      await api({ method: 'post', url: '/api/vendas', data: form })
      setModal(false)
      setForm(formVazio)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar venda')
    }
  }

  async function excluir(id) {
    if (!confirm('Deseja excluir esta venda?')) return
    await api({ method: 'delete', url: `/api/vendas/${id}` })
    carregar()
  }

  const filtrados = vendas.filter(v =>
    v.cliente.toLowerCase().includes(busca.toLowerCase())
  )

  const focusInput = e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })
  const blurInput  = e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Vendas</h2>
          <p style={s.pageSub}>{vendas.length} registradas</p>
        </div>
        <button style={s.btnPrimary} onClick={() => { setErro(''); setForm(formVazio); setModal(true) }}
          onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
        >+ Nova Venda</button>
      </div>

      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input style={s.searchInput} placeholder="Buscar por cliente..."
          value={busca} onChange={e => setBusca(e.target.value)}
          onFocus={e => Object.assign(e.target.style, { borderColor: '#3B7C5F', boxShadow: '0 0 0 3px rgba(59,124,95,0.1)' })}
          onBlur={e => Object.assign(e.target.style, { borderColor: '#EFEFEF', boxShadow: 'none' })}
        />
      </div>

      <div style={s.tableBox}>
        {filtrados.length === 0
          ? <p style={{ textAlign: 'center', padding: 32, color: '#808080', fontSize: 14 }}>
              Nenhuma venda registrada. Clique em <strong>Nova Venda</strong> para começar.
            </p>
          : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['Cliente', 'Data', 'Pagamento', 'Status', 'Total', 'Ações'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => (
                  <tr key={v.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td}><strong style={{ color: '#333333' }}>{v.cliente}</strong></td>
                    <td style={s.td}>{v.data}</td>
                    <td style={s.td}>{v.pagamento}</td>
                    <td style={s.td}><StatusBadge status={v.status} /></td>
                    <td style={{ ...s.td, fontWeight: 600, color: '#333333' }}>
                      R$ {Number(v.total).toFixed(2)}
                    </td>
                    <td style={s.td}>
                      <button style={s.btnDel} onClick={() => excluir(v.id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >🗑️ Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nova Venda</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Cliente</label>
                <select style={s.input} value={form.cliente}
                  onChange={e => setForm({ ...form, cliente: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput}>
                  <option value="">Sem cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Produto</label>
                <select style={s.input} value={form.produto_id}
                  onChange={e => setForm({ ...form, produto_id: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput} required>
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {Number(p.preco_venda).toFixed(2)} (Estoque: {p.quantidade})
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Quantidade</label>
                <input style={s.input} type="number" min="1" placeholder="1"
                  value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput} required />
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Pagamento</label>
                  <select style={s.input} value={form.pagamento}
                    onChange={e => setForm({ ...form, pagamento: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}>
                    {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'].map(p => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select style={s.input} value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}>
                    <option value="Concluída">Concluída</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              {erro && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 8px' }}>{erro}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" style={s.btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.background = '#2F5F4A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3B7C5F'}
                >Registrar Venda</button>
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
  btnDel: { background: 'transparent', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#EF4444', fontWeight: 600, transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { background: '#FFFFFF', borderRadius: 12, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0px 8px 24px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 600, color: '#333333', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#808080' },
  form: { display: 'flex', flexDirection: 'column' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#333333' },
  input: { width: '100%', padding: '12px 16px', border: '1px solid #EFEFEF', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", color: '#333333', transition: 'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  btnSecondary: { height: 40, padding: '0 20px', background: '#FFFFFF', color: '#3B7C5F', border: '1px solid #3B7C5F', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
}