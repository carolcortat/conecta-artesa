import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ backgroundColor: 'var(--azul-base)', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h2 style={{ margin: 0, fontSize: '20px' }}>ConectaArtesã</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
        <Link to="/insumos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Insumos</Link>
        <Link to="/produtos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Produtos</Link>
        <Link to="/pedidos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Pedidos</Link>
      </div>
    </nav>
  );
}

export default Navbar;