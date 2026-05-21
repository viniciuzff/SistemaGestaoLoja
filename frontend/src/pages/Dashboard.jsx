import { useState, useEffect } from 'react'
import axios from 'axios'

function Badge({ status }) {
  const map = {
    'Concluída': { bg:'#DCFCE7', color:'#15803D' },
    'Pendente':  { bg:'#FEF3C7', color:'#B45309' },
    'Cancelada': { bg:'#FEE2E2', color:'#DC2626' },
  }
  const st = map[status] || { bg:'#F3F4F6', color:'#6B7280' }
  return (
    <span style={{ ...st, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
      {status}
    </span>
  )
}

export default function Dashboard() {
  const [dados, setDados] = useState(null)

  useEffect(() => {
    axios.get('/api/dashboard', { withCredentials: true }).then(r => setDados(r.data))
  }, [])

  if (!dados) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <p style={{ color:'#9CA3AF', fontSize:14 }}>Carregando dados...</p>
    </div>
  )

  const cards = [
    { label:'Total de Produtos', value: dados.total_produtos, icon:'', color:'', light:'' },
    { label:'Total de Clientes', value: dados.total_clientes, icon:'', color:'', light:'' },
    { label:'Faturamento Total', value:`R$ ${Number(dados.faturamento).toFixed(2)}`, icon:'', color:'', light:'' },
    { label:'Estoque Baixo',     value: dados.estoque_baixo.length, icon:'', color:'', light:'' },
  ]

  return (
    <div>
      {/* CARDS */}
      <div style={s.cards}>
        {cards.map(c => (
          <div key={c.label} style={s.card}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={s.cardLabel}>{c.label}</p>
                <h2 style={{ ...s.cardValue, color: c.color }}>{c.value}</h2>
              </div>
              <div style={{ ...s.cardIcon, background: c.light }}>
                <span style={{ fontSize:22 }}>{c.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM ROW */}
      <div style={s.row}>
        {/* VENDAS RECENTES */}
        <div style={{ ...s.box, flex:1 }}>
          <div style={s.boxHead}>
            <h3 style={s.boxTitle}>Vendas Recentes</h3>
            <span style={s.boxBadge}>{dados.vendas_recentes.length} registros</span>
          </div>
          {dados.vendas_recentes.length === 0
            ? <div style={s.empty}>Nenhuma venda registrada ainda.</div>
            : <table style={s.table}>
                <thead>
                  <tr>
                    {['Cliente','Data','Pagamento','Status','Total'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.vendas_recentes.map((v,i) => (
                    <tr key={v.id} style={{ background: i%2===0 ? '#fff' : '#FAFAFA' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                      onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? '#fff' : '#FAFAFA'}
                    >
                      <td style={s.td}><strong style={{color:'#111827'}}>{v.cliente}</strong></td>
                      <td style={s.td}>{v.data}</td>
                      <td style={s.td}>{v.pagamento}</td>
                      <td style={s.td}><Badge status={v.status} /></td>
                      <td style={{ ...s.td, fontWeight:600, color:'#16A34A' }}>R$ {Number(v.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* ESTOQUE BAIXO */}
        <div style={{ ...s.box, width:280, flexShrink:0 }}>
          <div style={s.boxHead}>
            <h3 style={s.boxTitle}>Estoque Baixo</h3>
            {dados.estoque_baixo.length > 0 && (
              <span style={{ ...s.boxBadge, background:'#FEE2E2', color:'#DC2626' }}>
                {dados.estoque_baixo.length} alertas
              </span>
            )}
          </div>
          {dados.estoque_baixo.length === 0
            ? <div style={s.emptyGreen}><span>✅</span> Estoque normalizado</div>
            : dados.estoque_baixo.map(p => (
              <div key={p.id} style={s.estoqueRow}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={s.estoqueName}>{p.nome}</p>
                  <p style={s.estoqueSub}>Mín: {p.estoque_minimo} un.</p>
                </div>
                <span style={s.estoqueBadge}>{p.quantidade} un.</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const s = {
  cards: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  card: {
    background:'#fff', borderRadius:12, padding:'20px 22px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.05)', border:'1px solid #E5E7EB',
    transition:'transform 0.2s, box-shadow 0.2s', cursor:'default',
  },
  cardLabel: { fontSize:12, color:'#6B7280', fontWeight:500, margin:'0 0 8px' },
  cardValue: { fontSize:26, fontWeight:700, margin:0 },
  cardIcon: { width:48, height:48, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  row: { display:'flex', gap:16, alignItems:'flex-start' },
  box: { background:'#fff', borderRadius:12, padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', border:'1px solid #E5E7EB' },
  boxHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  boxTitle: { fontSize:14, fontWeight:600, color:'#111827', margin:0 },
  boxBadge: { background:'#F0FDF4', color:'#16A34A', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'8px 12px', fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #F3F4F6' },
  td: { padding:'11px 12px', fontSize:13, color:'#6B7280', borderBottom:'1px solid #F9FAFB', transition:'background 0.15s' },
  empty: { textAlign:'center', padding:'32px 0', color:'#9CA3AF', fontSize:13 },
  emptyGreen: { display:'flex', alignItems:'center', gap:8, padding:'16px 0', color:'#16A34A', fontSize:13, fontWeight:500 },
  estoqueRow: { display:'flex', alignItems:'center', gap:10, padding:'11px 0', borderBottom:'1px solid #F9FAFB' },
  estoqueName: { fontSize:13, fontWeight:500, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  estoqueSub: { fontSize:11, color:'#9CA3AF', margin:'2px 0 0' },
  estoqueBadge: { background:'#FEE2E2', color:'#DC2626', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, flexShrink:0 },
}