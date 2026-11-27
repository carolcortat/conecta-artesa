import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Insumos from './components/Insumos';
import Produtos from './components/Produtos';
import Pedidos from './components/Pedidos';
import Clientes from './components/Clientes';
import Financeiro from './components/Financeiro';
import { estaLogado } from './utils/auth';
import './responsivo.css';

// Telas do sistema: só abrem para quem fez login
function AreaRestrita() {
  if (!estaLogado()) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Sistema */}
        <Route element={<AreaRestrita />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/financeiro" element={<Financeiro />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;