import { useState, useEffect } from 'react'
import axios from 'axios'

const api = cfg => axios({ withCredentials: true, ...cfg })
const vazio = { cliente:'', produto_id:'', quantidade:1, pagamento:'Dinheiro', status:'Concluída', desconto:0 }

function Badge({ status }) {
  const map = { 'Concluída':['#DCFCE7','#15803D'], 'Pendente':['#FEF3C7','#B45309'], 'Cancelada':['#FEE2E2','#DC2626'] }
  const [bg, color] = map[status] || ['#F3F4F6','#6B7280']
  return <span style={{ background:bg, color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>{status}</span>
}

export default function Vendas() {
  const [vendas, setVendas]     = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(vazio)
  const [erro, setErro]         = useState('')
  const [busca, setBusca]       = useState('')
  const [loading, setLoading]   = useState(false)

  const carregar = () => Promise.all([
    api({ url:'/api/vendas' }).then(r => setVendas(r.data)),
    api({ url:'/api/clientes' }).then(r => setClientes(r.data)),
    api({ url:'/api/produtos', params:{ ativos:true } }).then(r => setProdutos(r.data)),
  ])
  useEffect(() => { carregar() }, [])

  // Calcula preview do total com desconto
  const produtoSelecionado = produtos.find(p => p.id === parseInt(form.produto_id))
  const subtotal = produtoSelecionado ? produtoSelecionado.preco_venda * parseInt(form.quantidade || 1) : 0
  const desconto_valor = subtotal * ((parseFloat(form.desconto) || 0) / 100)
  const totalPreview = subtotal - desconto_valor

  async function salvar(e) {
    e.preventDefault(); setErro(''); setLoading(true)
    try {
      await api({ method:'post', url:'/api/vendas', data:{
        ...form,
        desconto: parseFloat(form.desconto) || 0
      }})
      setModal(false); setForm(vazio); carregar()
    } catch(err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar venda')
    } finally { setLoading(false) }
  }

  async function excluir(id) {
    if (!confirm('Excluir esta venda?')) return
    await api({ method:'delete', url:`/api/vendas/${id}` }); carregar()
  }

  const filtrados = vendas.filter(v => v.cliente.toLowerCase().includes(busca.toLowerCase()))
  const focus = e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }
  const totalFaturado = filtrados.reduce((a,v) => a + (v.total||0), 0)

  return (
    <div>
      <div style={s.pageHead}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <p style={s.pageCount}>{vendas.length} vendas registradas</p>
          {vendas.length > 0 && (
            <span style={s.totalBadge}>Total: R$ {totalFaturado.toFixed(2)}</span>
          )}
        </div>
        <button style={s.btnPrimary} onClick={() => { setErro(''); setForm(vazio); setModal(true) }}
          onMouseEnter={e => e.currentTarget.style.background='#14532D'}
          onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
        >+ Nova Venda</button>
      </div>

      <div style={s.searchWrap}>
        <input style={s.searchInput} placeholder="Buscar por cliente..."
          value={busca} onChange={e => setBusca(e.target.value)} onFocus={focus} onBlur={blur} />
      </div>

      <div style={s.tableWrap}>
        {filtrados.length === 0
          ? <div style={s.emptyState}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>🛒</p>
              <p style={{ fontSize:15, fontWeight:600, color:'#374151', margin:'0 0 4px' }}>Nenhuma venda registrada</p>
              <p style={{ fontSize:13, color:'#9CA3AF' }}>Clique em + Nova Venda para começar</p>
            </div>
          : <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['#','Cliente','Data','Pagamento','Desconto','Status','Total','Ações'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((v,i) => (
                  <tr key={v.id} style={{ background: i%2===0?'#fff':'#FAFAFA', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background= i%2===0?'#fff':'#FAFAFA'}
                  >
                    <td style={{ ...s.td, color:'#9CA3AF', width:40 }}>{v.id}</td>
                    <td style={s.td}><strong style={{color:'#111827'}}>{v.cliente}</strong></td>
                    <td style={s.td}>{v.data}</td>
                    <td style={s.td}>{v.pagamento}</td>
                    <td style={s.td}>
                      {v.desconto > 0
                        ? <span style={s.descontoBadge}>{v.desconto}% OFF</span>
                        : <span style={{ color:'#9CA3AF', fontSize:12 }}>—</span>
                      }
                    </td>
                    <td style={s.td}><Badge status={v.status} /></td>
                    <td style={{ ...s.td, fontWeight:700, color:'#16A34A' }}>R$ {Number(v.total).toFixed(2)}</td>
                    <td style={s.td}>
                      <button style={s.btnDel} onClick={() => excluir(v.id)}>🗑 Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h3 style={s.modalTitle}>🛒 Nova Venda</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar}>
              <div style={s.field}>
                <label style={s.label}>Cliente</label>
                <select style={s.input} value={form.cliente} onChange={e => setForm({...form,cliente:e.target.value})} onFocus={focus} onBlur={blur}>
                  <option value="">Sem cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Produto *</label>
                <select style={s.input} value={form.produto_id} onChange={e => setForm({...form,produto_id:e.target.value})} onFocus={focus} onBlur={blur} required>
                  <option value="">Selecione o produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {Number(p.preco_venda).toFixed(2)} (Estoque: {p.quantidade})
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Quantidade *</label>
                  <input style={s.input} type="number" min="1" placeholder="1"
                    value={form.quantidade} onChange={e => setForm({...form,quantidade:e.target.value})}
                    onFocus={focus} onBlur={blur} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Desconto (%)</label>
                  <input style={s.input} type="number" min="0" max="100" placeholder="0"
                    value={form.desconto} onChange={e => setForm({...form,desconto:e.target.value})}
                    onFocus={focus} onBlur={blur} />
                </div>
              </div>

              {/* PREVIEW DO TOTAL */}
              {produtoSelecionado && (
                <div style={s.previewBox}>
                  <div style={s.previewRow}>
                    <span style={s.previewLabel}>Subtotal</span>
                    <span style={s.previewVal}>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {desconto_valor > 0 && (
                    <div style={s.previewRow}>
                      <span style={s.previewLabel}>Desconto ({form.desconto}%)</span>
                      <span style={{ ...s.previewVal, color:'#DC2626' }}>− R$ {desconto_valor.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ ...s.previewRow, borderTop:'1px solid #E5E7EB', paddingTop:10, marginTop:4 }}>
                    <span style={{ ...s.previewLabel, fontWeight:700, color:'#111827' }}>Total</span>
                    <span style={{ ...s.previewVal, fontSize:18, color:'#16A34A', fontWeight:700 }}>R$ {totalPreview.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Forma de Pagamento</label>
                  <select style={s.input} value={form.pagamento} onChange={e => setForm({...form,pagamento:e.target.value})} onFocus={focus} onBlur={blur}>
                    {['Dinheiro','Cartão de Crédito','Cartão de Débito','PIX'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select style={s.input} value={form.status} onChange={e => setForm({...form,status:e.target.value})} onFocus={focus} onBlur={blur}>
                    <option value="Concluída">Concluída</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {erro && <div style={s.erroBox}>⚠ {erro}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" style={{ ...s.btnPrimary, width:'auto', opacity:loading?0.8:1 }}
                  onMouseEnter={e => e.currentTarget.style.background='#14532D'}
                  onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
                  disabled={loading}
                >{loading ? 'Registrando...' : 'Registrar Venda'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  pageHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  pageCount: { fontSize:13, color:'#6B7280', margin:0 },
  totalBadge: { background:'#F0FDF4', color:'#16A34A', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  btnPrimary: { height:40, padding:'0 20px', background:'#16A34A', color:'#fff', border:'none', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', transition:'background 0.15s' },
  searchWrap: { marginBottom:16 },
  searchInput: { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', background:'#fff' },
  tableWrap: { background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', overflow:'hidden' },
  emptyState: { textAlign:'center', padding:'48px 0' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#F9FAFB' },
  th: { textAlign:'left', padding:'11px 16px', fontSize:11, color:'#6B7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #E5E7EB' },
  td: { padding:'12px 16px', fontSize:13.5, color:'#374151', borderBottom:'1px solid #F3F4F6' },
  descontoBadge: { background:'#FEF3C7', color:'#B45309', padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700 },
  btnDel: { padding:'5px 12px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal: { background:'#fff', borderRadius:14, padding:'28px 32px', width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  modalTitle: { fontSize:16, fontWeight:700, color:'#111827', margin:0 },
  closeBtn: { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#9CA3AF' },
  row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field: { marginBottom:14 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s' },
  previewBox: { background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:10, padding:'14px 16px', marginBottom:14 },
  previewRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  previewLabel: { fontSize:13, color:'#6B7280' },
  previewVal: { fontSize:14, fontWeight:600, color:'#111827' },
  erroBox: { background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#DC2626', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:12 },
  modalActions: { display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 },
  btnSecondary: { height:40, padding:'0 18px', background:'#fff', color:'#374151', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13.5, fontWeight:500, cursor:'pointer' },
}