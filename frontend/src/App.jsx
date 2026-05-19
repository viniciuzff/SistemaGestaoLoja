import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

import Login     from './pages/Login'
import Cadastro  from './pages/Cadastro'
import Layout    from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clientes  from './pages/Clientes'
import Produtos  from './pages/Produtos'
import Vendas    from './pages/Vendas'
import Estoque   from './pages/Estoque'

function PrivateRoute({ children, user }) {
  return user?.autenticado ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    axios.get('/api/me', { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser({ autenticado: false }))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", color: '#808080', background: '#F5F5F5', fontSize: 14,
    }}>
      Carregando...
    </div>
  )

  return (
    <Routes>
      <Route
        path="/login"
        element={user?.autenticado ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
      />

      <Route
        path="/cadastro"
        element={<Cadastro />}
      />

      <Route
        path="/"
        element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser({ autenticado: false })} />
          </PrivateRoute>
        }
      >
        <Route index           element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="produtos"  element={<Produtos />} />
        <Route path="vendas"    element={<Vendas />} />
        <Route path="estoque"   element={<Estoque />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}