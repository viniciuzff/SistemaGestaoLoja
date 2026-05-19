import { useState, useEffect } from 'react'
import axios from 'axios'

const api = (cfg) => axios({ withCredentials: true, ...cfg })

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    api({ url: '/api/estoque' }).then(r => setProdutos(r.data))
  }, [])

  const filtrados = produtos.filter(p => {
    if (filtro === 'baixo') return p.baixo
    if (filtro === 'ok') return !p.baixo
    return true
  })

  const totalBaixo = produtos.filter(p => p.baixo).length

  const filtros = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'baixo', label: '⚠️ Estoque Baixo' },
    { valor: 'ok',    label: '✅ Estoque OK' },
  ]

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Estoque</h2>
          <p style={s.pageSub}>{produtos.length} produtos cadastrados</p>
        </div>
        {totalBaixo > 0 && (
          <div style={s.alerta}>
            ⚠️ {totalBaixo} produto{totalBaixo > 1 ? 's' : ''} com estoque baixo
          </div>
        )}
      </div>

      {/* FILTROS */}
      <div style={s.filtros}>
        {filtros.map(f => (
          <button key={f.valor}
            style={{ ...s.filtroBtn, ...(filtro === f.valor ? s.filtroBtnAtivo : {}) }}
            onClick={() => setFiltro(f.valor)}
            onMouseEnter={e => { if (filtro !== f.valor) e.currentTarget.style.borderColor = '#3B7C5F' }}
            onMouseLeave={e => { if (filtro !== f.valor) e.currentTarget.style.borderColor = '#EFEFEF' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <div style={s.tableBox}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Produto', 'Categoria', 'Quantidade', 'Estoque Mínimo', 'Status', 'Situação'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0
              ? <tr><td colSpan={6} style={s.empty}>Nenhum produto encontrado.</td></tr>
              : filtrados.map(p => (
                <tr key={p.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={s.td}><strong style={{ color: '#333333' }}>{p.nome}</strong></td>
                  <td style={s.td}>{p.categoria}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 600, color: p.baixo ? '#EF4444' : '#22C55E', minWidth: 28 }}>
                        {p.quantidade}
                      </span>
                      <div style={s.barWrap}>
                        <div style={{
                          ...s.barFill,
                          width: `${Math.min(100, Math.round((p.quantidade / Math.max(p.estoque_minimo * 3, 1)) * 100))}%`,
                          background: p.baixo ? '#EF4444' : '#22C55E',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{p.estoque_minimo}</td>
                  <td style={s.td}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: p.status === 'Ativo' ? '#22C55E' : '#808080', color: '#FFFFFF',
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: p.baixo ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: p.baixo ? '#EF4444' : '#22C55E',
                    }}>
                      {p.baixo ? '⚠️ Baixo' : '✅ OK'}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

const s = {
  page: { fontFamily: "'Inter', sans-serif" },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  pageTitle: { fontSize: 32, fontWeight: 700, color: '#333333', margin: 0, lineHeight: 1.3 },
  pageSub: { color: '#808080', fontSize: 14, margin: '4px 0 0', lineHeight: 1.5 },
  alerta: { background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  filtros: { display: 'flex', gap: 8, marginBottom: 16 },
  filtroBtn: { height: 32, padding: '0 16px', border: '1px solid #EFEFEF', borderRadius: 8, background: '#FFFFFF', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter', sans-serif", color: '#808080', transition: 'all 0.2s ease-in-out' },
  filtroBtnAtivo: { background: '#3B7C5F', color: '#FFFFFF', borderColor: '#3B7C5F' },
  tableBox: { background: '#FFFFFF', borderRadius: 12, boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #EFEFEF' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#E8F5F1' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#2F5F4A', fontWeight: 600, borderBottom: '1px solid #EFEFEF' },
  td: { padding: '14px 16px', fontSize: 14, color: '#808080', borderBottom: '1px solid #EFEFEF', transition: 'background 0.15s' },
  empty: { padding: '32px', textAlign: 'center', color: '#808080', fontSize: 14 },
  barWrap: { flex: 1, background: '#EFEFEF', borderRadius: 4, height: 6, minWidth: 80 },
  barFill: { height: 6, borderRadius: 4, transition: 'width 0.3s ease-in-out' },
}