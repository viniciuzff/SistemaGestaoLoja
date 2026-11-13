import { Download } from 'lucide-react'

function escapar(valor) {
  const texto = String(valor ?? '')
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export default function BotaoExportar({ dados, colunas, nomeArquivo }) {
  function exportar() {
    const cabecalho = colunas.map(c => escapar(c.label)).join(';')
    const linhas = dados.map(item =>
      colunas.map(c => escapar(c.format ? c.format(item[c.key], item) : item[c.key])).join(';')
    )
    // \uFEFF faz o Excel reconhecer acentos (UTF-8) e ';' separa as colunas no padrão brasileiro
    const csv = '\uFEFF' + [cabecalho, ...linhas].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const hoje = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `${nomeArquivo}_${hoje}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      style={{ ...s.btn, opacity: dados.length === 0 ? 0.5 : 1, cursor: dados.length === 0 ? 'not-allowed' : 'pointer' }}
      onClick={exportar}
      disabled={dados.length === 0}
      onMouseEnter={e => { if (dados.length) e.currentTarget.style.background = '#F0FDF4' }}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      <Download size={15} /> Exportar CSV
    </button>
  )
}

const s = {
  btn: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', background: '#fff', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, fontWeight: 600, transition: 'background 0.15s' },
}