import { useState, useEffect } from 'react'
import axios from 'axios'

const api = cfg => axios({ withCredentials: true, ...cfg })
const vazio = { nome:'', categoria:'', preco_venda:'', preco_custo:'', quantidade:'', estoque_minimo:'', status:'Ativo' }
const categorias = ['Vestuário','Calçados','Acessórios','Eletrônicos','Outros']

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca]       = useState('')
  const [modal, setModal]       = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState(vazio)
  const [loading, setLoading]   = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview]   = useState(null)
  const [view, setView]         = useState('cards') // 'cards' ou 'tabela'

  const carregar = (b='') => api({ url:'/api/produtos', params:{busca:b} }).then(r => setProdutos(r.data))
  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setEditando(null); setForm(vazio)
    setImageFile(null); setPreview(null)
    setModal(true)
  }

  function abrirEditar(p) {
    setEditando(p)
    setForm({ nome:p.nome, categoria:p.categoria, preco_venda:p.preco_venda, preco_custo:p.preco_custo, quantidade:p.quantidade, estoque_minimo:p.estoque_minimo, status:p.status })
    setPreview(p.imagem ? `http://127.0.0.1:5000${p.imagem}` : null)
    setImageFile(null)
    setModal(true)
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)) }
  }

  async function salvar(e) {
    e.preventDefault(); setLoading(true)
    try {
      let id = editando?.id
      if (editando) {
        await api({ method:'put', url:`/api/produtos/${id}`, data:form })
      } else {
        const r = await api({ method:'post', url:'/api/produtos', data:form })
        id = r.data.id
      }
      if (imageFile && id) {
        const fd = new FormData()
        fd.append('imagem', imageFile)
        await axios.post(`/api/produtos/${id}/imagem`, fd, { withCredentials:true })
      }
      setModal(false); carregar(busca)
    } finally { setLoading(false) }
  }

  async function excluir(id) {
    if (!confirm('Excluir este produto?')) return
    await api({ method:'delete', url:`/api/produtos/${id}` }); carregar(busca)
  }

  const focus = e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }

  return (
    <div>
      <div style={s.pageHead}>
        <p style={s.pageCount}>{produtos.length} produtos cadastrados</p>
        <div style={{ display:'flex', gap:8 }}>
          <button style={view==='cards' ? s.btnViewActive : s.btnView} onClick={() => setView('cards')}>⊞ Cards</button>
          <button style={view==='tabela' ? s.btnViewActive : s.btnView} onClick={() => setView('tabela')}>☰ Tabela</button>
          <button style={s.btnPrimary} onClick={abrirNovo}
            onMouseEnter={e => e.currentTarget.style.background='#14532D'}
            onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
          >+ Novo Produto</button>
        </div>
      </div>

      <div style={s.searchWrap}>
        <input style={s.searchInput} placeholder="Buscar produto..."
          value={busca} onChange={e => { setBusca(e.target.value); carregar(e.target.value) }}
          onFocus={focus} onBlur={blur} />
      </div>

      {/* CARDS */}
      {view === 'cards' && (
        <div style={s.grid}>
          {produtos.length === 0
            ? <p style={s.empty}>Nenhum produto encontrado.</p>
            : produtos.map(p => {
              const baixo = (p.quantidade||0) <= (p.estoque_minimo||0)
              return (
                <div key={p.id} style={s.card}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                >
                  <div style={s.cardImg}>
                    {p.imagem
                      ? <img src={`http://127.0.0.1:5000${p.imagem}`} alt={p.nome} style={s.img} />
                      : <span style={s.imgPlaceholder}>📦</span>
                    }
                    <span style={{ ...s.statusBadge, position:'absolute', top:8, right:8, background: p.status==='Ativo'?'#DCFCE7':'#F3F4F6', color: p.status==='Ativo'?'#15803D':'#6B7280' }}>
                      {p.status}
                    </span>
                  </div>
                  <div style={s.cardBody}>
                    <p style={s.catBadge}>{p.categoria}</p>
                    <h3 style={s.cardName}>{p.nome}</h3>
                    <div style={s.cardRow}>
                      <span style={s.cardPrice}>R$ {Number(p.preco_venda).toFixed(2)}</span>
                      <span style={{ fontSize:12, color: baixo?'#DC2626':'#6B7280', fontWeight: baixo?700:400 }}>
                        {p.quantidade} un. {baixo?'⚠️':''}
                      </span>
                    </div>
                    <div style={s.cardActions}>
                      <button style={s.btnEdit} onClick={() => abrirEditar(p)}>✏ Editar</button>
                      <button style={s.btnDel}  onClick={() => excluir(p.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      )}

      {/* TABELA */}
      {view === 'tabela' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['#','Imagem','Nome','Categoria','Preço Venda','Estoque','Status','Ações'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0
                ? <tr><td colSpan={8} style={s.empty}>Nenhum produto encontrado.</td></tr>
                : produtos.map((p,i) => {
                  const baixo = (p.quantidade||0) <= (p.estoque_minimo||0)
                  return (
                    <tr key={p.id} style={{ background: i%2===0?'#fff':'#FAFAFA', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                      onMouseLeave={e => e.currentTarget.style.background= i%2===0?'#fff':'#FAFAFA'}
                    >
                      <td style={{ ...s.td, color:'#9CA3AF', width:40 }}>{p.id}</td>
                      <td style={s.td}>
                        {p.imagem
                          ? <img src={`http://127.0.0.1:5000${p.imagem}`} alt={p.nome} style={{ width:40, height:40, objectFit:'cover', borderRadius:8 }} />
                          : <div style={{ width:40, height:40, background:'#F3F4F6', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📦</div>
                        }
                      </td>
                      <td style={s.td}><strong style={{color:'#111827'}}>{p.nome}</strong></td>
                      <td style={s.td}><span style={s.catTag}>{p.categoria}</span></td>
                      <td style={{ ...s.td, fontWeight:600, color:'#16A34A' }}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight:600, color: baixo?'#DC2626':'#16A34A' }}>
                          {p.quantidade} {baixo?'⚠️':''}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, background: p.status==='Ativo'?'#DCFCE7':'#F3F4F6', color: p.status==='Ativo'?'#15803D':'#6B7280' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button style={s.btnEdit} onClick={() => abrirEditar(p)}>✏ Editar</button>
                          <button style={s.btnDel}  onClick={() => excluir(p.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h3 style={s.modalTitle}>{editando ? '✏ Editar Produto' : '+ Novo Produto'}</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar}>

              {/* UPLOAD DE IMAGEM */}
              <div style={s.field}>
                <label style={s.label}>Imagem do Produto</label>
                <div style={s.uploadArea} onClick={() => document.getElementById('imgInput').click()}>
                  {preview
                    ? <img src={preview} alt="preview" style={s.previewImg} />
                    : <div style={s.uploadPlaceholder}>
                        <span style={{ fontSize:32 }}>📷</span>
                        <span style={{ fontSize:13, color:'#6B7280', marginTop:8 }}>Clique para selecionar</span>
                        <span style={{ fontSize:11, color:'#9CA3AF' }}>PNG, JPG, WEBP</span>
                      </div>
                  }
                </div>
                <input id="imgInput" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Nome do Produto</label>
                <input style={s.input} placeholder="Ex: Camiseta Polo" value={form.nome}
                  onChange={e => setForm({...form,nome:e.target.value})} onFocus={focus} onBlur={blur} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Categoria</label>
                <select style={s.input} value={form.categoria} onChange={e => setForm({...form,categoria:e.target.value})} onFocus={focus} onBlur={blur}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Preço de Venda (R$)</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0,00" value={form.preco_venda}
                    onChange={e => setForm({...form,preco_venda:e.target.value})} onFocus={focus} onBlur={blur} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Preço de Custo (R$)</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0,00" value={form.preco_custo}
                    onChange={e => setForm({...form,preco_custo:e.target.value})} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Quantidade em Estoque</label>
                  <input style={s.input} type="number" placeholder="0" value={form.quantidade}
                    onChange={e => setForm({...form,quantidade:e.target.value})} onFocus={focus} onBlur={blur} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Estoque Mínimo</label>
                  <input style={s.input} type="number" placeholder="0" value={form.estoque_minimo}
                    onChange={e => setForm({...form,estoque_minimo:e.target.value})} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status} onChange={e => setForm({...form,status:e.target.value})} onFocus={focus} onBlur={blur}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" style={{ ...s.btnPrimary, width:'auto', opacity:loading?0.8:1 }}
                  onMouseEnter={e => e.currentTarget.style.background='#14532D'}
                  onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
                  disabled={loading}
                >{loading ? 'Salvando...' : 'Salvar Produto'}</button>
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
  btnPrimary: { height:40, padding:'0 20px', background:'#16A34A', color:'#fff', border:'none', borderRadius:8, fontSize:13.5, fontWeight:600, cursor:'pointer', transition:'background 0.15s' },
  btnView: { height:40, padding:'0 14px', background:'#fff', color:'#6B7280', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, cursor:'pointer' },
  btnViewActive: { height:40, padding:'0 14px', background:'#F0FDF4', color:'#16A34A', border:'1px solid #BBF7D0', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 },
  searchWrap: { marginBottom:16 },
  searchInput: { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', background:'#fff' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 },
  card: { background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s', cursor:'default' },
  cardImg: { height:160, background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' },
  img: { width:'100%', height:'100%', objectFit:'contain', padding:'8px' },
  imgPlaceholder: { fontSize:48 },
  cardBody: { padding:16 },
  cardName: { fontSize:14, fontWeight:700, color:'#111827', margin:'4px 0 8px' },
  cardRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cardPrice: { fontSize:16, fontWeight:700, color:'#16A34A' },
  cardActions: { display:'flex', gap:8 },
  catBadge: { fontSize:11, color:'#6B7280', background:'#F3F4F6', padding:'2px 8px', borderRadius:20, display:'inline-block', margin:'0 0 4px' },
  catTag: { background:'#F3F4F6', color:'#6B7280', padding:'3px 10px', borderRadius:20, fontSize:12 },
  statusBadge: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  tableWrap: { background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#F9FAFB' },
  th: { textAlign:'left', padding:'11px 16px', fontSize:11, color:'#6B7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #E5E7EB' },
  td: { padding:'12px 16px', fontSize:13.5, color:'#374151', borderBottom:'1px solid #F3F4F6' },
  empty: { textAlign:'center', padding:'40px', color:'#9CA3AF', fontSize:14 },
  actions: { display:'flex', gap:6 },
  btnEdit: { padding:'5px 12px', background:'#F0FDF4', color:'#16A34A', border:'1px solid #BBF7D0', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' },
  btnDel:  { padding:'5px 10px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:6, fontSize:12, cursor:'pointer' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal: { background:'#fff', borderRadius:14, padding:'28px 32px', width:'100%', maxWidth:500, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  modalTitle: { fontSize:16, fontWeight:700, color:'#111827', margin:0 },
  closeBtn: { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#9CA3AF' },
  uploadArea: { border:'2px dashed #E5E7EB', borderRadius:10, height:150, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:'#FAFAFA' },
  uploadPlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  previewImg: { width:'100%', height:'100%', objectFit:'cover' },
  row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field: { marginBottom:14 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 },
  btnSecondary: { height:40, padding:'0 18px', background:'#fff', color:'#374151', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13.5, fontWeight:500, cursor:'pointer' },
}