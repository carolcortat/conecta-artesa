import React, { useState, useEffect } from 'react';

const FORMAS_PAGAMENTO = ['Pix', 'Cartão', 'Dinheiro'];

const brl = (valor) =>
  'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatarData = (iso) => {
  if (!iso) return 'sem data';
  const [ano, mes, dia] = String(iso).split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
};

function Financeiro() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [formasEscolhidas, setFormasEscolhidas] = useState({}); // id do pedido -> forma de pagamento

  const carregarDados = async () => {
    try {
      const [resPedidos, resProdutos] = await Promise.all([
        fetch('http://localhost:8080/api/pedidos'),
        fetch('http://localhost:8080/api/produtos')
      ]);
      const listaPedidos = await resPedidos.json();
      const listaProdutos = await resProdutos.json();
      setPedidos(Array.isArray(listaPedidos) ? listaPedidos : []);
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
    } catch (erro) {
      console.error('Erro ao carregar dados financeiros:', erro);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Itens do pedido (pedidos antigos, sem lista de itens, viram um item só)
  const itensDoPedido = (ped) => {
    if (ped.itens && ped.itens.length > 0) return ped.itens;
    const prod = produtos.find(p => p.id === ped.produtoId);
    return [{
      produtoId: ped.produtoId,
      quantidade: ped.quantidade || 1,
      valorUnitario: ped.valorUnitario != null ? ped.valorUnitario : (prod ? prod.precoFinal : 0)
    }];
  };

  const valorDoPedido = (ped) => {
    if (ped.valorTotal != null) return Number(ped.valorTotal);
    return itensDoPedido(ped).reduce(
      (acc, i) => acc + (Number(i.valorUnitario) || 0) * (i.quantidade || 1),
      0
    );
  };

  // Marca o pagamento como recebido (e define a forma de pagamento)
  const receberPagamento = async (ped) => {
    const forma = formasEscolhidas[ped.id] || ped.formaPagamento || 'Pix';
    const corpo = {
      clienteNome: ped.clienteNome,
      clienteId: ped.clienteId || null,
      itens: itensDoPedido(ped).map(i => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario
      })),
      dataEntrega: ped.dataEntrega || null,
      statusPedido: ped.statusPedido,
      pagamentoRecebido: true,
      formaPagamento: forma,
      observacoes: ped.observacoes
    };

    try {
      const resposta = await fetch(`http://localhost:8080/api/pedidos/${ped.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
      });
      if (!resposta.ok) {
        const texto = await resposta.text();
        alert(texto && texto.length < 200 ? texto : 'Erro ao registrar o pagamento.');
        return;
      }
      carregarDados();
    } catch (erro) {
      console.error('Erro ao registrar pagamento:', erro);
    }
  };

  // ---- Cálculos ----
  const recebidos = pedidos.filter(p => p.pagamentoRecebido);
  const pendentes = pedidos.filter(p => !p.pagamentoRecebido);

  const totalRecebido = recebidos.reduce((acc, p) => acc + valorDoPedido(p), 0);
  const totalAReceber = pendentes.reduce((acc, p) => acc + valorDoPedido(p), 0);
  const totalGeral = totalRecebido + totalAReceber;

  // Recebido por forma de pagamento
  const porForma = [...FORMAS_PAGAMENTO, 'Não informada'].map((forma) => {
    const valor = recebidos
      .filter(p => (FORMAS_PAGAMENTO.includes(p.formaPagamento) ? p.formaPagamento : 'Não informada') === forma)
      .reduce((acc, p) => acc + valorDoPedido(p), 0);
    return { forma, valor };
  }).filter(item => item.valor > 0 || FORMAS_PAGAMENTO.includes(item.forma));

  const maiorForma = Math.max(...porForma.map(i => i.valor), 1);

  const recebimentosRecentes = [...recebidos].sort((a, b) => b.id - a.id).slice(0, 8);
  const aReceberOrdenado = [...pendentes].sort((a, b) => {
    // quem entrega primeiro aparece primeiro; sem data vai para o fim
    const da = a.dataEntrega || '9999-12-31';
    const db = b.dataEntrega || '9999-12-31';
    return da.localeCompare(db);
  });

  const linhaPedido = (ped) => (
    <div
      key={ped.id}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--canvas)', border: '1px solid var(--line)', borderRadius: '10px', flexWrap: 'wrap' }}
    >
      <div>
        <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{ped.clienteNome}</strong>
        <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
          Pedido #{String(ped.id).padStart(4, '0')} · entrega {formatarData(ped.dataEntrega)}
        </div>
      </div>
      {ped.pagamentoRecebido ? (
        <div style={{ textAlign: 'right' }}>
          <strong style={{ color: 'var(--sage)' }}>{brl(valorDoPedido(ped))}</strong>
          <div style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{ped.formaPagamento || 'forma não informada'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: 'var(--clay)', marginRight: '4px' }}>{brl(valorDoPedido(ped))}</strong>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '6px 8px', fontSize: '12px' }}
            value={formasEscolhidas[ped.id] || ped.formaPagamento || 'Pix'}
            onChange={(e) => setFormasEscolhidas({ ...formasEscolhidas, [ped.id]: e.target.value })}
            title="Forma de pagamento"
          >
            {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="button" className="button-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => receberPagamento(ped)}>
            Receber
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="welcome">
        <div>
          <span className="eyebrow">CONTROLE FINANCEIRO</span>
          <h1>Financeiro</h1>
          <p>Veja o que já entrou, o que ainda falta receber e como seus clientes pagam.</p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-sage" style={{ fontSize: '20px', fontWeight: 700 }}>✓</div>
          <div>
            <span>Recebido</span>
            <strong>{brl(totalRecebido)}</strong>
            <small>{recebidos.length} {recebidos.length === 1 ? 'pedido pago' : 'pedidos pagos'}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-clay" style={{ fontSize: '20px', fontWeight: 700 }}>!</div>
          <div>
            <span>A receber</span>
            <strong>{brl(totalAReceber)}</strong>
            <small>{pendentes.length} {pendentes.length === 1 ? 'pagamento pendente' : 'pagamentos pendentes'}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-plum" style={{ fontSize: '18px', fontWeight: 700 }}>R$</div>
          <div>
            <span>Total em pedidos</span>
            <strong>{brl(totalGeral)}</strong>
            <small>{pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} no total</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-sage" style={{ fontSize: '16px', fontWeight: 700 }}>%</div>
          <div>
            <span>Já recebido</span>
            <strong>{totalGeral > 0 ? ((totalRecebido / totalGeral) * 100).toFixed(0) : 0}%</strong>
            <small>do valor total dos pedidos</small>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'start' }}>

        {/* Recebido por forma de pagamento */}
        <div className="card">
          <span className="card-kicker">RECEBIMENTOS</span>
          <h3>Por forma de pagamento</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {porForma.map((item) => (
              <div key={item.forma}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                  <span>{item.forma}</span>
                  <strong>{brl(item.valor)}</strong>
                </div>
                <div style={{ height: '8px', borderRadius: '8px', background: 'var(--line)', overflow: 'hidden' }}>
                  <div style={{ width: `${(item.valor / maiorForma) * 100}%`, height: '100%', background: 'var(--plum)', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
          {recebidos.length === 0 && (
            <p style={{ color: 'var(--ink-faint)', fontSize: '12.5px', marginTop: '14px' }}>
              Nenhum pagamento recebido ainda.
            </p>
          )}
        </div>

        {/* A receber */}
        <div className="card">
          <span className="card-kicker">PENDENTES</span>
          <h3>A receber</h3>
          {aReceberOrdenado.length === 0 ? (
            <p style={{ color: 'var(--ink-faint)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              Nenhum pagamento pendente. 🎉
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {aReceberOrdenado.map(linhaPedido)}
            </div>
          )}
        </div>
      </div>

      {/* Recebimentos recentes */}
      <div className="card" style={{ marginTop: '16px' }}>
        <span className="card-kicker">HISTÓRICO</span>
        <h3>Recebimentos recentes</h3>
        {recebimentosRecentes.length === 0 ? (
          <p style={{ color: 'var(--ink-faint)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
            Quando você marcar um pagamento como recebido, ele aparece aqui.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {recebimentosRecentes.map(linhaPedido)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Financeiro;
