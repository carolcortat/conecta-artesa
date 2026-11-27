import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { estoqueBaixo } from '../utils/estoque';

function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/pedidos').then(res => res.json()),
      fetch('http://localhost:8080/api/produtos').then(res => res.json()),
      fetch('http://localhost:8080/api/insumos').then(res => res.json())
    ])
      .then(([dadosPedidos, dadosProdutos, dadosInsumos]) => {
        setPedidos(dadosPedidos);
        setProdutos(dadosProdutos);
        setInsumos(dadosInsumos);
      })
      .catch(err => console.error('Erro ao carregar dados da dashboard:', err));
  }, []);

  const insumosBaixos = insumos.filter(estoqueBaixo);

  const emProducao = pedidos.filter(p => p.statusPedido === 'Em produção').length;
  const aguardando = pedidos.filter(p => p.statusPedido === 'Novo').length;
  const concluidos = pedidos.filter(p => p.statusPedido === 'Entregue').length;

  // Recebimentos = soma dos pedidos com pagamento marcado como recebido
  const totalRecebimentos = pedidos
    .filter(p => p.pagamentoRecebido)
    .reduce((acc, p) => {
      if (p.valorTotal != null) return acc + Number(p.valorTotal);
      const prod = produtos.find(prod => prod.id === p.produtoId);
      return acc + (prod ? prod.precoFinal : 0) * (p.quantidade || 1);
    }, 0);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="welcome">
        <div>
          <span className="eyebrow">PAINEL DE CONTROLE</span>
          <h1>Olá, bem-vinda ao seu Ateliê</h1>
          <p>Acompanhe suas encomendas, receitas e materiais em um só lugar.</p>
        </div>
        <Link to="/pedidos" className="button-primary">
          + Nova Encomenda
        </Link>
      </div>

      {/* Cards de Métricas com a Paleta do Figma */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-sage"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-dollar-sign preview-icon"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg></div>
          <div>
            <span>Recebimentos</span>
            <strong>R$ {totalRecebimentos.toFixed(2)}</strong>
            <small>Faturamento realizado</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-clay"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package preview-icon"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg></div>
          <div>
            <span>Em Produção</span>
            <strong>{emProducao}</strong>
            <small>Pedidos em andamento</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-gold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass preview-icon"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg></div>
          <div>
            <span>Aguardando / Pendentes</span>
            <strong>{aguardando}</strong>
            <small>Na fila de espera</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-plum"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-check preview-icon"><path d="M12 22V12"/><path d="m16 17 2 2 4-4"/><path d="M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753"/><path d="M3.29 7 12 12l8.71-5"/><path d="m7.5 4.27 8.997 5.148"/></svg></div>
          <div>
            <span>Entregas Concluídas</span>
            <strong>{concluidos}</strong>
            <small>Total finalizado</small>
          </div>
        </div>
      </div>

      {/* Resumo do Catálogo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Alerta de estoque */}
        <div
          style={{
            background: insumosBaixos.length > 0
              ? 'linear-gradient(145deg, #c66f55, #b05f48)'
              : 'linear-gradient(145deg, #668476, #557264)',
            color: '#fff',
            borderRadius: '18px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><polyline points="3.29 7 12 12 20.71 7" /><path d="m7.5 4.27 9 5.15" /></svg>
            </div>
            <div>
              <span style={{ fontSize: '10px', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.85 }}>
                {insumosBaixos.length > 0 ? 'ATENÇÃO AO ESTOQUE' : 'ESTOQUE EM DIA'}
              </span>
              <strong style={{ display: 'block', fontSize: '17px', marginTop: '2px' }}>
                {insumosBaixos.length === 0
                  ? 'Nenhum material acabando'
                  : insumosBaixos.length === 1
                    ? '1 material está acabando'
                    : `${insumosBaixos.length} materiais estão acabando`}
              </strong>
            </div>
          </div>

          {insumosBaixos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              {insumosBaixos.slice(0, 5).map((ins) => (
                <div key={ins.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>
                  <span>{ins.nome}</span>
                  <strong>{ins.quantidadeEstoque} {ins.unidadeMedida}</strong>
                </div>
              ))}
              {insumosBaixos.length > 5 && (
                <span style={{ opacity: 0.85 }}>+ {insumosBaixos.length - 5} outros</span>
              )}
            </div>
          )}

          <Link to="/insumos" style={{ color: '#fff', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>
            Ver materiais &gt;
          </Link>
        </div>

        <div className="card">
          <span className="card-kicker">INVENTÁRIO</span>
          <h3>Insumos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--ink-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
              <span>Produtos precificados:</span>
              <strong style={{ color: 'var(--plum-dark)' }}>{produtos.length} peças</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Insumos cadastrados:</span>
              <strong style={{ color: 'var(--plum-dark)' }}>{insumos.length} itens</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <span className="card-kicker">ACESSO RÁPIDO</span>
          <h3>Ações do Dia</h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
            Cadastre novos materiais ou calcule o preço de venda de uma peça nova.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/produtos" className="button-primary" style={{ flex: 1 }}>
              Precificar Produto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;