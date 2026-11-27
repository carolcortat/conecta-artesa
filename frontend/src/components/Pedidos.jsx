import React, { useState, useEffect } from 'react';

const STATUS_OPCOES = ['Novo', 'Em produção', 'Pronto', 'Entregue'];
const FORMAS_PAGAMENTO = ['Pix', 'Cartão', 'Dinheiro'];
const ITEM_VAZIO = { produtoId: '', quantidade: 1, valorUnitario: '' };

const estiloStatus = (status) => {
  switch (status) {
    case 'Entregue':
    case 'Pronto':
      return { background: 'var(--sage-soft)', color: 'var(--sage)' };
    case 'Em produção':
      return { background: 'var(--clay-soft)', color: 'var(--clay)' };
    default:
      return { background: 'var(--line)', color: 'var(--ink)' };
  }
};

const formatarData = (iso) => {
  if (!iso) return '—';
  const [ano, mes, dia] = String(iso).split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
};

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = novo pedido
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');

  // Campos do formulário
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }]);
  const [dataEntrega, setDataEntrega] = useState('');
  const [statusPedido, setStatusPedido] = useState('Novo');
  const [pagamentoRecebido, setPagamentoRecebido] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [observacoes, setObservacoes] = useState('');

  const carregarDados = async () => {
    // Cada lista é buscada separadamente: se uma falhar, as outras continuam funcionando
    const buscar = async (url) => {
      try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`${url} respondeu ${resposta.status}`);
        const dados = await resposta.json();
        return Array.isArray(dados) ? dados : [];
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        return [];
      }
    };

    const [listaPedidos, listaProdutos, listaClientes] = await Promise.all([
      buscar('http://localhost:8080/api/pedidos'),
      buscar('http://localhost:8080/api/produtos'),
      buscar('http://localhost:8080/api/clientes')
    ]);
    setPedidos(listaPedidos);
    setProdutos(listaProdutos);
    setClientes(listaClientes);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const nomeProduto = (id) => {
    const prod = produtos.find(p => p.id === Number(id));
    return prod ? prod.nome : 'Produto removido';
  };

  // Itens de um pedido (pedidos antigos, sem lista de itens, viram um item só)
  const itensDoPedido = (ped) => {
    if (ped.itens && ped.itens.length > 0) return ped.itens;
    const prod = produtos.find(p => p.id === ped.produtoId);
    return [{
      produtoId: ped.produtoId,
      quantidade: ped.quantidade || 1,
      valorUnitario: ped.valorUnitario != null ? ped.valorUnitario : (prod ? prod.precoFinal : 0)
    }];
  };

  // Valor do pedido: usa o total salvo; se não houver (pedidos antigos), soma os itens
  const valorDoPedido = (ped) => {
    if (ped.valorTotal != null) return Number(ped.valorTotal);
    return itensDoPedido(ped).reduce(
      (acc, i) => acc + (Number(i.valorUnitario) || 0) * (i.quantidade || 1),
      0
    );
  };

  const quantidadeDoPedido = (ped) =>
    itensDoPedido(ped).reduce((acc, i) => acc + (i.quantidade || 0), 0);

  // ---- Itens do formulário ----
  const atualizarItem = (indice, campo, valor) => {
    setItens(itens.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  };

  // Ao escolher o produto, já preenche o valor com o preço dele
  const escolherProduto = (indice, id) => {
    const prod = produtos.find(p => p.id === parseInt(id));
    setItens(itens.map((item, i) =>
      i === indice
        ? { ...item, produtoId: id, valorUnitario: prod && prod.precoFinal != null ? String(prod.precoFinal) : '' }
        : item
    ));
  };

  const adicionarItem = () => setItens([...itens, { ...ITEM_VAZIO }]);

  const removerItem = (indice) => {
    if (itens.length === 1) return; // sempre fica pelo menos 1 produto
    setItens(itens.filter((_, i) => i !== indice));
  };

  const totalFormulario = itens.reduce(
    (acc, i) => acc + (parseFloat(i.valorUnitario) || 0) * (parseInt(i.quantidade) || 0),
    0
  );

  // ---- Abrir / fechar formulário ----
  const limparFormulario = () => {
    setCliente('');
    setItens([{ ...ITEM_VAZIO }]);
    setDataEntrega('');
    setStatusPedido('Novo');
    setPagamentoRecebido(false);
    setFormaPagamento('Pix');
    setObservacoes('');
  };

  const abrirNovo = () => {
    limparFormulario();
    setEditandoId(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
    limparFormulario();
  };

  const abrirEdicao = (ped) => {
    setEditandoId(ped.id);
    setCliente(ped.clienteNome || '');
    setItens(itensDoPedido(ped).map(i => ({
      produtoId: String(i.produtoId),
      quantidade: i.quantidade,
      valorUnitario: i.valorUnitario != null ? String(i.valorUnitario) : ''
    })));
    setDataEntrega(ped.dataEntrega ? String(ped.dataEntrega).split('T')[0] : '');
    setStatusPedido(STATUS_OPCOES.includes(ped.statusPedido) ? ped.statusPedido : 'Novo');
    setPagamentoRecebido(!!ped.pagamentoRecebido);
    setFormaPagamento(ped.formaPagamento || 'Pix');
    setObservacoes(ped.observacoes || '');
    setModalAberto(true);
  };

  // Cliente cadastrado que tem o mesmo nome digitado (para guardar o vínculo com o cadastro)
  const clienteCadastrado = clientes.find(
    c => (c.nome || '').trim().toLowerCase() === cliente.trim().toLowerCase()
  );

  // ---- Salvar (novo ou edição) ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (itens.some(i => !i.produtoId)) {
      alert('Escolha o produto em todas as linhas ou remova a linha vazia.');
      return;
    }

    const pedido = {
      clienteNome: cliente.trim(), // o backend espera "clienteNome"
      clienteId: clienteCadastrado ? clienteCadastrado.id : null,
      itens: itens.map(i => ({
        produtoId: parseInt(i.produtoId),
        quantidade: parseInt(i.quantidade) || 1,
        valorUnitario: parseFloat(i.valorUnitario) || 0
      })),
      dataEntrega: dataEntrega || null,
      statusPedido,
      pagamentoRecebido,
      formaPagamento,
      observacoes
    };

    try {
      const url = editandoId
        ? `http://localhost:8080/api/pedidos/${editandoId}`
        : 'http://localhost:8080/api/pedidos';

      const resposta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido),
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error('Resposta do servidor:', resposta.status, texto);
        alert('Erro ao salvar a encomenda! ' + (texto.length < 200 ? texto : 'Veja o console do backend.'));
        return;
      }

      fecharModal();
      carregarDados();
    } catch (erro) {
      console.error('Erro ao salvar pedido:', erro);
      alert('Não foi possível falar com o servidor.');
    }
  };

  // Atualização rápida direto na tabela (status ou pagamento recebido)
  const atualizarPedido = async (ped, campos) => {
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
      pagamentoRecebido: !!ped.pagamentoRecebido,
      formaPagamento: ped.formaPagamento,
      observacoes: ped.observacoes,
      ...campos
    };

    try {
      const resposta = await fetch(`http://localhost:8080/api/pedidos/${ped.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
      });
      if (!resposta.ok) {
        const texto = await resposta.text();
        alert(texto && texto.length < 200 ? texto : 'Erro ao atualizar o pedido.');
        return;
      }
      carregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar pedido:', erro);
    }
  };

  const excluirPedido = async (ped) => {
    if (!window.confirm(`Excluir o pedido #${String(ped.id).padStart(4, '0')} de ${ped.clienteNome}?`)) return;
    try {
      const resposta = await fetch(`http://localhost:8080/api/pedidos/${ped.id}`, { method: 'DELETE' });
      if (!resposta.ok) {
        alert('Erro ao excluir o pedido.');
        return;
      }
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir pedido:', erro);
    }
  };

  // Indicadores
  const totalPedidos = pedidos.length;
  const emProducaoCount = pedidos.filter(p => p.statusPedido === 'Em produção').length;
  const valorTotalPedidos = pedidos.reduce((acc, p) => acc + valorDoPedido(p), 0);

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusca = (p.clienteNome || '').toLowerCase().includes(busca.toLowerCase());
    if (filtroStatus === 'Todos') return matchBusca;
    return matchBusca && p.statusPedido === filtroStatus;
  });

  return (
    <div className="orders-page">

      {/* Cabeçalho */}
      <div className="orders-heading">
        <div>
          <span className="eyebrow">GESTÃO DE ENCOMENDAS</span>
          <h1>Pedidos</h1>
          <p>Organize prazos, pagamentos e cada etapa da sua produção.</p>
        </div>
        <button className="button-primary" onClick={abrirNovo}>
          + Novo pedido
        </button>
      </div>

      {/* Cards de Métricas Superiores */}
      <div className="order-metrics">
        <article>
          <div className="metric-icon metric-plum">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list preview-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
          </div>
          <div>
            <span>Total de pedidos</span>
            <strong>{totalPedidos}</strong>
            <small>cadastrados</small>
          </div>
        </article>

        <article>
          <div className="metric-icon metric-clay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package preview-icon"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><polyline points="3.29 7 12 12 20.71 7" /><path d="m7.5 4.27 9 5.15" /></svg>
          </div>
          <div>
            <span>Em produção</span>
            <strong>{emProducaoCount}</strong>
            <small>entregas próximas</small>
          </div>
        </article>

        <article>
          <div className="metric-icon metric-sage">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-dollar-sign preview-icon"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
          </div>
          <div>
            <span>Valor em pedidos</span>
            <strong>R$ {valorTotalPedidos.toFixed(2)}</strong>
            <small>total acumulado</small>
          </div>
        </article>
      </div>

      {/* Bloco principal com a tabela e filtros */}
      <div className="card orders-management" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Barra de Ferramentas / Busca */}
        <div className="orders-toolbar">
          <div className="orders-toolbar-search">
            <span></span>
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Abas de Filtro por Status */}
        <div className="order-filters">
          {['Todos', ...STATUS_OPCOES].map((status) => {
            const count = status === 'Todos'
              ? pedidos.length
              : pedidos.filter(p => p.statusPedido === status).length;

            const ativo = filtroStatus === status;
            return (
              <button
                key={status}
                className={ativo ? 'order-filter-active' : ''}
                onClick={() => setFiltroStatus(status)}
              >
                {status} <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tabela de Pedidos */}
        <div className="orders-table-wrap">
          {pedidosFiltrados.length === 0 ? (
            <div className="orders-empty" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-faint)' }}>
              <div className="orders-empty-icon" style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <strong>Nenhum pedido encontrado</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Tente mudar os filtros ou cadastre uma nova encomenda.</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente e Produtos</th>
                  <th>Qtd.</th>
                  <th>Entrega</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((ped) => {
                  const statusAtual = ped.statusPedido || 'Novo';
                  const resumoItens = itensDoPedido(ped)
                    .map(i => `${i.quantidade}× ${nomeProduto(i.produtoId)}`)
                    .join(', ');

                  return (
                    <tr key={ped.id}>
                      <td><strong>#{String(ped.id).padStart(4, '0')}</strong></td>
                      <td>
                        <div className="table-customer">
                          <div>
                            <strong style={{ color: 'var(--ink)' }}>{ped.clienteNome || 'Cliente'}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                              {resumoItens}
                            </span>
                            {ped.observacoes && (
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-faint)', marginTop: '2px', fontStyle: 'italic' }}>
                                Obs: {ped.observacoes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{quantidadeDoPedido(ped)} un</td>
                      <td>{formatarData(ped.dataEntrega)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => atualizarPedido(ped, { pagamentoRecebido: !ped.pagamentoRecebido })}
                          title="Clique para marcar como recebido ou pendente"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: ped.pagamentoRecebido ? 'var(--sage-soft)' : 'var(--clay-soft)',
                            color: ped.pagamentoRecebido ? 'var(--sage)' : 'var(--clay)'
                          }}
                        >
                          {ped.pagamentoRecebido ? '✓ Recebido' : 'Pendente'}
                        </button>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-faint)', marginTop: '3px' }}>
                          {ped.formaPagamento || '—'}
                        </span>
                      </td>
                      <td><strong>R$ {valorDoPedido(ped).toFixed(2)}</strong></td>
                      <td>
                        <select
                          value={statusAtual}
                          onChange={(e) => atualizarPedido(ped, { statusPedido: e.target.value })}
                          title="Alterar status"
                          style={{ padding: '4px 8px', borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer', ...estiloStatus(statusAtual) }}
                        >
                          {!STATUS_OPCOES.includes(statusAtual) && <option value={statusAtual}>{statusAtual}</option>}
                          {STATUS_OPCOES.map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button type="button" onClick={() => abrirEdicao(ped)} style={{ color: 'var(--plum-dark)', fontWeight: '600', fontSize: '12px' }}>
                            Editar
                          </button>
                          <button type="button" onClick={() => excluirPedido(ped)} style={{ color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal de Novo / Editar Pedido */}
      {modalAberto && (
        <div className="modal-layer">
          <div className="modal">
            <div className="modal-head">
              <h2>{editandoId ? 'Editar Encomenda' : 'Nova Encomenda'}</h2>
              <button onClick={fecharModal} style={{ fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome do cliente</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Digite ou escolha um cliente cadastrado"
                  list="lista-clientes"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                />
                <datalist id="lista-clientes">
                  {clientes.map((c) => (
                    <option key={c.id} value={c.nome} />
                  ))}
                </datalist>
                {cliente.trim() && (
                  <small style={{ display: 'block', marginTop: '4px', color: clienteCadastrado ? 'var(--sage)' : 'var(--ink-faint)' }}>
                    {clienteCadastrado
                      ? '✓ Cliente cadastrado'
                      : 'Cliente novo. Cadastre-o em Clientes para guardar contato e endereço.'}
                  </small>
                )}
              </div>

              {/* Lista de produtos do pedido */}
              <div className="form-group">
                <label>Produtos do pedido</label>

                {itens.map((item, indice) => (
                  <div key={indice} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <select
                      value={item.produtoId}
                      onChange={(e) => escolherProduto(indice, e.target.value)}
                      className="form-input"
                      style={{ flex: 3 }}
                      required
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map((prod) => (
                        <option key={prod.id} value={prod.id}>{prod.nome}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ flex: 1 }}
                      title="Quantidade"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(indice, 'quantidade', e.target.value)}
                      required
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      style={{ flex: 1 }}
                      title="Valor unitário (R$)"
                      placeholder="R$"
                      value={item.valorUnitario}
                      onChange={(e) => atualizarItem(indice, 'valorUnitario', e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removerItem(indice)}
                      disabled={itens.length === 1}
                      title="Remover produto"
                      style={{ color: 'var(--clay)', fontWeight: 'bold', padding: '0 6px', opacity: itens.length === 1 ? 0.3 : 1 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="button-secondary"
                  onClick={adicionarItem}
                  style={{ marginTop: '4px' }}
                >
                  + Adicionar outro produto
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total do pedido</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`R$ ${totalFormulario.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Data da entrega</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {STATUS_OPCOES.map((op) => (
                    <button
                      key={op}
                      type="button"
                      className={`category-pill ${statusPedido === op ? 'active' : ''}`}
                      onClick={() => setStatusPedido(op)}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Pagamento</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pagamentoRecebido}
                    onChange={(e) => setPagamentoRecebido(e.target.checked)}
                  />
                  Pagamento recebido
                </label>
              </div>

              <div className="form-group">
                <label>Forma de pagamento</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <button
                      key={forma}
                      type="button"
                      className={`category-pill ${formaPagamento === forma ? 'active' : ''}`}
                      onClick={() => setFormaPagamento(forma)}
                    >
                      {forma}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  rows="3"
                  maxLength="1000"
                  className="form-input"
                  placeholder="Ex: cor preferida, embalagem para presente, endereço de entrega..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button-secondary" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="button-primary">{editandoId ? 'Salvar alterações' : 'Salvar Pedido'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Pedidos;
