import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Movimentacoes() {
  const [movs, setMovs]       = useState([])
  const [produtos, setProdutos] = useState([])
  const [form, setForm]       = useState({ produto_id: '', tipo: 'Entrada', quantidade: '', motivo: '' })
  const [erro, setErro]       = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const carregar = () => {
    axios.get('/api/movimentacoes', { withCredentials: true }).then(r => setMovs(r.data))
    axios.get('/api/produtos?ativos=false', { withCredentials: true }).then(r => setProdutos(r.data))
  }

  useEffect(() => { carregar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setLoading(true)
    try {
      await axios.post('/api/movimentacoes', {
        ...form,
        quantidade: parseInt(form.quantidade)
      }, { withCredentials: true })
      setSucesso('Movimentação registrada com sucesso!')
      setForm({ produto_id: '', tipo: 'Entrada', quantidade: '', motivo: '' })
      carregar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar movimentação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Movimentações de Estoque</h2>
          <p style={s.subtitle}>Registre entradas e saídas do estoque</p>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div style={s.box}>
        <h3 style={s.boxTitle}>Nova Movimentação</h3>
        {erro    && <div style={s.erro}>{erro}</div>}
        {sucesso && <div style={s.sucesso}>{sucesso}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Produto</label>
            <select
              style={s.input}
              value={form.produto_id}
              onChange={e => setForm({...form, produto_id: e.target.value})}
              required
            >
              <option value="">Selecione um produto</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} (estoque: {p.quantidade})
                </option>
              ))}
            </select>
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Tipo</label>
              <select
                style={s.input}
                value={form.tipo}
                onChange={e => setForm({...form, tipo: e.target.value})}
              >
                <option value="Entrada">📦 Entrada</option>
                <option value="Saída">📤 Saída</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Quantidade</label>
              <input
                style={s.input}
                type="number"
                min="1"
                placeholder="0"
                value={form.quantidade}
                onChange={e => setForm({...form, quantidade: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Motivo (opcional)</label>
            <input
              style={s.input}
              type="text"
              placeholder="Ex: Reposição de fornecedor, Ajuste de inventário..."
              value={form.motivo}
              onChange={e => setForm({...form, motivo: e.target.value})}
            />
          </div>

          <button style={loading ? s.btnDisabled : s.btn} type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Movimentação'}
          </button>
        </form>
      </div>

      {/* HISTÓRICO */}
      <div style={s.box}>
        <div style={s.boxHead}>
          <h3 style={s.boxTitle}>Histórico</h3>
          <span style={s.badge}>{movs.length} registros</span>
        </div>
        {movs.length === 0
          ? <div style={s.empty}>Nenhuma movimentação registrada ainda.</div>
          : <table style={s.table}>
              <thead>
                <tr>
                  {['Produto', 'Tipo', 'Quantidade', 'Motivo', 'Data'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movs.map((m, i) => (
                  <tr key={m.id}
                    style={{ background: i%2===0 ? '#fff' : '#FAFAFA' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? '#fff' : '#FAFAFA'}
                  >
                    <td style={s.td}><strong style={{color:'#111827'}}>{m.produto}</strong></td>
                    <td style={s.td}>
                      <span style={m.tipo === 'Entrada' ? s.badgeEntrada : s.badgeSaida}>
                        {m.tipo === 'Entrada' ? '📦 Entrada' : '📤 Saída'}
                      </span>
                    </td>
                    <td style={s.td}><strong>{m.quantidade} un.</strong></td>
                    <td style={s.td}>{m.motivo || '—'}</td>
                    <td style={s.td}>{m.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  )
}

const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  title: { fontSize:22, fontWeight:700, color:'#111827', margin:0 },
  subtitle: { fontSize:13, color:'#6B7280', margin:'4px 0 0' },
  box: { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', border:'1px solid #E5E7EB', marginBottom:16 },
  boxHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  boxTitle: { fontSize:14, fontWeight:600, color:'#111827', margin:'0 0 16px' },
  form: { display:'flex', flexDirection:'column', gap:4 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  field: { marginBottom:12 },
  label: { display:'block', fontSize:12, fontWeight:500, color:'#6B7280', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' },
  input: { width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', background:'#FAFAFA', boxSizing:'border-box', fontFamily:'inherit' },
  btn: { marginTop:8, padding:'11px 24px', background:'#16A34A', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', alignSelf:'flex-start' },
  btnDisabled: { marginTop:8, padding:'11px 24px', background:'#86EFAC', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'not-allowed', alignSelf:'flex-start' },
  erro: { background:'#FEE2E2', border:'1px solid #FECACA', color:'#DC2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12 },
  sucesso: { background:'#DCFCE7', border:'1px solid #86EFAC', color:'#15803D', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'8px 12px', fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #F3F4F6' },
  td: { padding:'11px 12px', fontSize:13, color:'#6B7280', borderBottom:'1px solid #F9FAFB' },
  badge: { background:'#F0FDF4', color:'#16A34A', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  badgeEntrada: { background:'#DCFCE7', color:'#15803D', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  badgeSaida: { background:'#FEE2E2', color:'#DC2626', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  empty: { textAlign:'center', padding:'32px 0', color:'#9CA3AF', fontSize:13 },
}