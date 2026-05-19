import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [dados, setDados] = useState(null)

  useEffect(() => {
    axios.get('/api/dashboard', { withCredentials: true }).then(r => setDados(r.data))
  }, [])

  if (!dados) return <p style={{ color: '#808080', fontFamily: "'Inter', sans-serif" }}>Carregando...</p>

  const cards = [
    { titulo: 'Total de Produtos',  valor: dados.total_produtos,                     icone: '📦', cor: '#3B82F6' },
    { titulo: 'Total de Clientes',  valor: dados.total_clientes,                     icone: '👥', cor: '#3B7C5F' },
    { titulo: 'Faturamento',        valor: `R$ ${Number(dados.faturamento).toFixed(2)}`, icone: '💰', cor: '#EAB308' },
    { titulo: 'Estoque Baixo',      valor: dados.estoque_baixo.length,               icone: '⚠️', cor: '#EF4444' },
  ]

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Dashboard</h2>
        <p style={s.pageSub}>Visão geral da loja</p>
      </div>

      {/* STAT CARDS */}
      <div style={s.cards}>
        {cards.map(c => (
          <div key={c.titulo} style={s.card}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0,0,0,0.08)'}
          >
            <div style={{ ...s.cardIcon, background: c.cor + '18' }}>
              <span style={{ fontSize: 20 }}>{c.icone}</span>
            </div>
            <div>
              <p style={s.cardLabel}>{c.titulo}</p>
              <h3 style={{ ...s.cardValor, color: c.cor }}>{c.valor}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={s.row}>
        {/* VENDAS RECENTES */}
        <div style={{ ...s.box, flex: 1 }}>
          <h3 style={s.boxTitle}>Vendas Recentes</h3>
          {dados.vendas_recentes.length === 0
            ? <p style={s.empty}>Nenhuma venda registrada.</p>
            : (
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    {['Cliente', 'Data', 'Pagamento', 'Status', 'Total'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.vendas_recentes.map(v => (
                    <tr key={v.id}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={s.td}>{v.cliente}</td>
                      <td style={s.td}>{v.data}</td>
                      <td style={s.td}>{v.pagamento}</td>
                      <td style={s.td}><StatusBadge status={v.status} /></td>
                      <td style={{ ...s.td, fontWeight: 600 }}>R$ {Number(v.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* ESTOQUE BAIXO */}
        <div style={{ ...s.box, width: 280, flexShrink: 0 }}>
          <h3 style={s.boxTitle}> Estoque Baixo</h3>
          {dados.estoque_baixo.length === 0
            ? <p style={s.empty}>Tudo em ordem!</p>
            : dados.estoque_baixo.map(p => (
              <div key={p.id} style={s.estoqueItem}>
                <span style={s.estoqueNome}>{p.nome}</span>
                <span style={s.estoqueBadge}>{p.quantidade} un.</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'Concluída': { bg: '#22C55E', color: '#FFFFFF' },
    'Pendente':  { bg: '#EAB308', color: '#000000' },
    'Cancelada': { bg: '#EF4444', color: '#FFFFFF' },
  }
  const st = map[status] || { bg: '#EFEFEF', color: '#333333' }
  return (
    <span style={{
      background: st.bg, color: st.color,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, lineHeight: 1.4,
    }}>
      {status}
    </span>
  )
}

const s = {
  page: { fontFamily: "'Inter', sans-serif" },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 32, fontWeight: 700, color: '#333333', margin: 0, lineHeight: 1.3 },
  pageSub: { color: '#808080', fontSize: 14, margin: '4px 0 0', lineHeight: 1.5 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  card: {
    background: '#FFFFFF', borderRadius: 12, padding: 20,
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #EFEFEF',
    transition: 'box-shadow 0.2s ease-in-out', cursor: 'default',
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardLabel: { margin: '0 0 4px', fontSize: 12, color: '#808080', fontWeight: 400, lineHeight: 1.4 },
  cardValor: { margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
  row: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  box: {
    background: '#FFFFFF', borderRadius: 12, padding: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', border: '1px solid #EFEFEF',
  },
  boxTitle: { fontSize: 16, fontWeight: 600, color: '#333333', margin: '0 0 16px', lineHeight: 1.3 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#E8F5F1' },
  th: {
    textAlign: 'left', padding: '12px 16px',
    fontSize: 12, color: '#2F5F4A', fontWeight: 600,
    borderBottom: '1px solid #EFEFEF', lineHeight: 1.4,
  },
  td: { padding: '14px 16px', fontSize: 14, color: '#333333', borderBottom: '1px solid #EFEFEF', lineHeight: 1.5 },
  empty: { color: '#808080', fontSize: 14, lineHeight: 1.5 },
  estoqueItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #EFEFEF',
  },
  estoqueNome: { fontSize: 14, color: '#333333' },
  estoqueBadge: {
    background: 'rgba(239,68,68,0.1)', color: '#EF4444',
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
}