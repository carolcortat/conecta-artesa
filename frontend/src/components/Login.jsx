import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import './Landing.css';
import { CONTA_DEMO, entrar, estaLogado } from '../utils/auth';
import logo from '../utils/logo';

function Login() {
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');

  // quem já está logado vai direto para o painel
  if (estaLogado()) return <Navigate to="/painel" replace />;

  const enviar = (e) => {
    e.preventDefault();
    if (entrar(email, senha)) {
      navegar('/painel');
    } else {
      setErro('E-mail ou senha incorretos. Confira os dados e tente de novo.');
    }
  };

  const usarDemo = () => {
    setEmail(CONTA_DEMO.email);
    setSenha(CONTA_DEMO.senha);
    setErro('');
  };


  return (
    <div className="lg">
      <aside className="lg-side">
        <Link to="/" className="lg-side-logo"><img src={logo} alt="ConectaArtesã" /></Link>
        <div>
          <h2>Seu ateliê em ordem, do material ao pagamento.</h2>
          <p>Preço, estoque, pedidos, clientes e financeiro reunidos em um só lugar.</p>
        </div>
        <Link to="/" className="lg-side-back">Voltar para a página inicial</Link>
      </aside>

      <div className="lg-panel">
        <form className="lg-form" onSubmit={enviar} noValidate>
          <Link to="/" className="lg-form-logo" aria-label="ConectaArtesã, página inicial">
            <img src={logo} alt="ConectaArtesã" />
          </Link>
          <Link to="/" className="lg-mobile-back">Voltar para a página inicial</Link>
          <h1>Entrar</h1>
          <p>Acesse o painel do seu ateliê.</p>

          {erro && <div className="lg-erro" role="alert">{erro}</div>}

          <div className="lg-field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" className="lg-input" autoComplete="email"
                   placeholder="voce@email.com" value={email}
                   onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="lg-field">
            <label htmlFor="senha">Senha</label>
            <div className="lg-input-wrap">
              <input id="senha" type={mostrar ? 'text' : 'password'} className="lg-input"
                     autoComplete="current-password" value={senha}
                     onChange={(e) => setSenha(e.target.value)} required />
              <button type="button" className="lg-toggle" onClick={() => setMostrar(!mostrar)}
                      aria-pressed={mostrar}>
                {mostrar ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button type="submit" className="lg-btn">Entrar</button>

          <div className="lg-demo">
            <strong>Conta de demonstração</strong><br />
            E-mail: {CONTA_DEMO.email}<br />
            Senha: {CONTA_DEMO.senha}<br />
            <button type="button" onClick={usarDemo}>Preencher automaticamente</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;