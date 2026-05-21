import { useState, useEffect } from 'react'
import axios from 'axios'

const api = cfg => axios({ withCredentials: true, ...cfg })
const vazio = { nome:'', email:'', telefone:'' }

export default function Clientes() {
  const [clientes, setClientes]   = useState([])
  const [busca, setBusca]         = useState('')
  const [modal, setModal]         = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(vazio)
  const [loading, setLoading]     = useState(false)

  const carregar = () => api({ url:'/api/clientes' }).then(r => setClientes(r.data))
  useEffect(() => { carregar() }, [])

  const filtrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))

  function abrirNovo()  { setEditando(null); setForm(vazio); setModal(true) }
  function abrirEditar(c) { setEditando(c); setForm({ nome:c.nome, email:c.email, telefone:c.telefone }); setModal(true) }

  async function salvar(e) {
    e.preventDefault(); setLoading(true)
    try {
      if (editando) await api({ method:'put', url:`/api/clientes/${editando.id}`, data:form })
      else await api({ method:'post', url:'/api/clientes', data:form })
      setModal(false); carregar()
    } finally { setLoading(false) }
  }

  async function excluir(id) {
    if (!confirm('Excluir este cliente?')) return
    await api({ method:'delete', url:`/api/clientes/${id}` }); carregar()
  }

  const focus = e => { e.target.style.borderColor='#16A34A'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }

  return (
    <div>
      {/* HEADER */}
      <div style={s.pageHead}>
        <div>
          <p style={s.pageCount}>{clientes.length} clientes cadastrados</p>
        </div>
        <button style={s.btnPrimary} onClick={abrirNovo}
          onMouseEnter={e => e.currentTarget.style.background='#14532D'}
          onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
        >+ Novo Cliente</button>
      </div>

      {/* BUSCA */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}></span>
        <input style={s.searchInput} placeholder="Buscar por nome..."
          value={busca} onChange={e => setBusca(e.target.value)}
          onFocus={focus} onBlur={blur} />
      </div>

      {/* TABLE */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>#</th>
              <th style={s.th}>Nome</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Telefone</th>
              <th style={s.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0
              ? <tr><td colSpan={5} style={s.empty}>Nenhum cliente encontrado.</td></tr>
              : filtrados.map((c,i) => (
                <tr key={c.id} style={{ background: i%2===0 ? '#fff' : '#FAFAFA', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                  onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? '#fff' : '#FAFAFA'}
                >
                  <td style={{ ...s.td, color:'#9CA3AF', width:48 }}>{c.id}</td>
                  <td style={s.td}>
                    <div style={s.nameCell}>
                      <div style={s.nameAvatar}>{c.nome.charAt(0).toUpperCase()}</div>
                      <strong style={{color:'#111827'}}>{c.nome}</strong>
                    </div>
                  </td>
                  <td style={s.td}>{c.email}</td>
                  <td style={s.td}>{c.telefone}</td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={s.btnEdit} onClick={() => abrirEditar(c)}> Editar</button>
                      <button style={s.btnDel}  onClick={() => excluir(c.id)}> Excluir</button>
                    </div>
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
            <div style={s.modalHead}>
              <h3 style={s.modalTitle}>{editando ? ' Editar Cliente' : '+ Novo Cliente'}</h3>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={salvar}>
              {[
                { key:'nome', label:'Nome completo', type:'text', ph:'Ex: João Silva' },
                { key:'email', label:'Email', type:'email', ph:'email@exemplo.com' },
                { key:'telefone', label:'Telefone', type:'text', ph:'(00) 00000-0000' },
              ].map(f => (
                <div key={f.key} style={s.field}>
                  <label style={s.label}>{f.label}</label>
                  <input style={s.input} type={f.type} placeholder={f.ph}
                    value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                    onFocus={focus} onBlur={blur} required={f.key==='nome'} />
                </div>
              ))}
              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" style={{ ...s.btnPrimary, width:'auto', opacity: loading ? 0.8 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background='#14532D'}
                  onMouseLeave={e => e.currentTarget.style.background='#16A34A'}
                  disabled={loading}
                >{loading ? 'Salvando...' : 'Salvar Cliente'}</button>
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
  searchWrap: { position:'relative', marginBottom:16 },
  searchIcon: { position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, pointerEvents:'none' },
  searchInput: { width:'100%', padding:'10px 14px 10px 38px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s', background:'#fff' },
  tableWrap: { background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#F9FAFB' },
  th: { textAlign:'left', padding:'11px 16px', fontSize:11, color:'#6B7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #E5E7EB' },
  td: { padding:'13px 16px', fontSize:13.5, color:'#374151', borderBottom:'1px solid #F3F4F6' },
  empty: { textAlign:'center', padding:'40px', color:'#9CA3AF', fontSize:14 },
  nameCell: { display:'flex', alignItems:'center', gap:10 },
  nameAvatar: { width:32, height:32, borderRadius:8, background:'#F0FDF4', color:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 },
  actions: { display:'flex', gap:6 },
  btnEdit: { padding:'5px 12px', background:'#F0FDF4', color:'#16A34A', border:'1px solid #BBF7D0', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' },
  btnDel:  { padding:'5px 12px', background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal: { background:'#fff', borderRadius:14, padding:'28px 32px', width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' },
  modalHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  modalTitle: { fontSize:16, fontWeight:700, color:'#111827', margin:0 },
  closeBtn: { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#9CA3AF' },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s' },
  modalActions: { display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 },
  btnSecondary: { height:40, padding:'0 18px', background:'#fff', color:'#374151', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13.5, fontWeight:500, cursor:'pointer' },
}