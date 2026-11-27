import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { sair } from '../utils/auth';
import logo from '../utils/logo';

// Ícone padrão do menu (15x15)
function Icone({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ITENS_MENU = [
  {
    caminho: '/painel',
    rotulo: 'Visão Geral',
    icone: (
      <>
        <path d="M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    )
  },
  {
    caminho: '/pedidos',
    rotulo: 'Pedidos',
    icone: (
      <>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </>
    )
  },
  {
    caminho: '/clientes',
    rotulo: 'Clientes',
    icone: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <path d="M16 3.128a4 4 0 0 1 0 7.744" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <circle cx="9" cy="7" r="4" />
      </>
    )
  },
  {
    caminho: '/insumos',
    rotulo: 'Insumos',
    icone: (
      <>
        <path d="M14 6h2a2 2 0 0 1 2 2v5" />
        <path d="M14.21 15.202 18 17.4V22" />
        <path d="M14.796 14.611A1.6 1.6 0 0 0 14 15.995v3.013a1.6 1.6 0 0 0 .797 1.384l2.4 1.392a1.6 1.6 0 0 0 1.606 0l2.4-1.392A1.6 1.6 0 0 0 22 19.008v-3.013a1.6 1.6 0 0 0-.796-1.384l-2.4-1.394a1.6 1.6 0 0 0-1.514-.051z" />
        <path d="m18 17.4 3.79-2.198" />
        <path d="M2.21 4.202 6 6.4V16a2 2 0 0 0 2 2h2" />
        <path d="M2.796 3.611A1.6 1.6 0 0 0 2 4.995v3.013a1.6 1.6 0 0 0 .797 1.384l2.4 1.392a1.6 1.6 0 0 0 1.606 0l2.4-1.392A1.6 1.6 0 0 0 10 8.008V4.995a1.6 1.6 0 0 0-.796-1.384l-2.4-1.394a1.6 1.6 0 0 0-1.514-.052z" />
        <path d="m6 6.4 3.79-2.198" />
      </>
    )
  },
  {
    caminho: '/produtos',
    rotulo: 'Produtos',
    icone: (
      <>
        <path d="M12 3v6" />
        <path d="M16.76 3a2 2 0 0 1 1.8 1.1l2.23 4.479a2 2 0 0 1 .21.891V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.472a2 2 0 0 1 .211-.894L5.45 4.1A2 2 0 0 1 7.24 3z" />
        <path d="M3.054 9.013h17.893" />
      </>
    )
  },
  {
    caminho: '/financeiro',
    rotulo: 'Financeiro',
    icone: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </>
    )
  }
];

function Sidebar() {
  const location = useLocation();
  const navegar = useNavigate();
  const [aberto, setAberto] = useState(false);

  // fecha o menu ao trocar de página (celular)
  useEffect(() => {
    setAberto(false);
  }, [location.pathname]);

  // Esc fecha o menu
  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape') setAberto(false); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  const fazerLogout = () => {
    sair();
    navegar('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'nav-item nav-item-active' : 'nav-item');

  return (
    <>
    <div className="mobile-bar">
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setAberto(true)}
        aria-label="Abrir menu"
        aria-expanded={aberto}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <img src={logo} alt="ConectaArtesã" />
    </div>
    <div
      className={aberto ? 'sidebar-overlay sidebar-overlay-ativo' : 'sidebar-overlay'}
      onClick={() => setAberto(false)}
      aria-hidden="true"
    />
    <aside className={aberto ? 'sidebar sidebar-aberta' : 'sidebar'}>
      {/* Marca / Logo */}
      <div className="brand">
        <img
          src={logo}
          alt="ConectaArtesã"
        />
        <div>
          <small>Gestão de Ateliê</small>
        </div>
      </div>

      {/* Navegação Lateral */}
      <nav className="main-nav">
        <span className="nav-caption">MENU</span>

        {ITENS_MENU.map((item) => (
          <Link key={item.caminho} to={item.caminho} className={isActive(item.caminho)}>
            <span><Icone>{item.icone}</Icone></span> {item.rotulo}
          </Link>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="sidebar-bottom">
        <div className="tip-card">
          <strong>💡 Dica de Precificação</strong>
          <p>Seus custos de insumos e tempo de trabalho mantêm seu lucro garantido.</p>
        </div>

        <div className="profile">
          <div className="profile-avatar">CA</div>
          <div>
            <strong>Meu Ateliê</strong>
            <span>ConectaArtesã</span>
          </div>
        </div>
        <button
          type="button"
          onClick={fazerLogout}
          style={{ marginTop: '10px', width: '100%', padding: '9px', border: '1px solid var(--line)', borderRadius: '10px', color: 'var(--plum-dark)', fontWeight: 600, fontSize: '13px' }}
        >
          Sair
        </button>
      </div>
    </aside>
    </>
  );
}

export default Sidebar;