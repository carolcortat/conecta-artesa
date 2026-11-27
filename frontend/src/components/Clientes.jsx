import React, { useState, useEffect } from 'react';

const brl = (valor) =>
  'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');

  // Formulário
  const [editandoId, setEditandoId] = useState(null); // null = novo cliente
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');

  const buscarLista = async (url) => {
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error(`${url} respondeu ${resposta.status}`);
      const dados = await resposta.json();
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error('Erro ao buscar dados:', erro);
      return [];
    }
  };

  const carregarDados = async () => {
    const [listaClientes, listaPedidos, listaProdutos] = await Promise.all([
      buscarLista('http://localhost:8080/api/clientes'),
      buscarLista('http://localhost:8080/api/pedidos'),
      buscarLista('http://localhost:8080/api/produtos')
    ]);
    setClientes(listaClientes);
    setPedidos(listaPedidos);
    setProdutos(listaProdutos);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Valor de um pedido (pedidos antigos, sem total salvo, são calculados pelo preço do produto)
  const valorDoPedido = (ped) => {
    if (ped.valorTotal != null) return Number(ped.valorTotal);
    const prod = produtos.find(p => p.id === ped.produtoId);
    return (prod ? Number(prod.precoFinal) : 0) * (ped.quantidade || 1);
  };

  // Pedidos de um cliente: pelo id do cadastro ou, se não houver, pelo nome
  const pedidosDoCliente = (cliente) =>
    pedidos.filter(p =>
      p.clienteId === cliente.id ||
      (!p.clienteId && (p.clienteNome || '').trim().toLowerCase() === (cliente.nome || '').trim().toLowerCase())
    );

  const limparFormulario = () => {
    setEditandoId(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setEndereco('');
  };

  const iniciarEdicao = (cliente) => {
    setEditandoId(cliente.id);
    setNome(cliente.nome || '');
    setTelefone(cliente.telefone || '');
    setEmail(cliente.email || '');
    setEndereco(cliente.endereco || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cliente = { nome, telefone, email, endereco };

    try {
      const url = editandoId
        ? `http://localhost:8080/api/clientes/${editandoId}`
        : 'http://localhost:8080/api/clientes';

      const resposta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error('Resposta do servidor:', resposta.status, texto);
        alert('Erro ao salvar cliente! ' + (texto && texto.length < 200 ? texto : 'Veja o console do backend.'));
        return;
      }

      limparFormulario();
      carregarDados();
    } catch (erro) {
      console.error('Erro ao salvar cliente:', erro);
      alert('Não foi possível falar com o servidor.');
    }
  };

  const excluirCliente = async (cliente) => {
    if (!window.confirm(`Excluir o cliente "${cliente.nome}"? Os pedidos dele continuam salvos.`)) return;
    try {
      const resposta = await fetch(`http://localhost:8080/api/clientes/${cliente.id}`, { method: 'DELETE' });
      if (!resposta.ok) {
        alert('Erro ao excluir o cliente.');
        return;
      }
      if (editandoId === cliente.id) limparFormulario();
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir cliente:', erro);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const termo = busca.toLowerCase();
    return (
      (c.nome || '').toLowerCase().includes(termo) ||
      (c.telefone || '').toLowerCase().includes(termo) ||
      (c.email || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div>
      <div className="welcome">
        <div>
          <span className="eyebrow">RELACIONAMENTO</span>
          <h1>Clientes</h1>
          <p>Guarde os contatos de quem compra de você e acompanhe o histórico de pedidos.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', alignItems: 'start' }}>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="card">
          <span className="card-kicker">{editandoId ? 'EDITANDO CLIENTE' : 'NOVO CLIENTE'}</span>
          <h3>{editandoId ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>

          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Ana Martins"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone / WhatsApp</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Ex: (11) 91234-5678"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="Ex: ana@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Endereço de entrega</label>
            <textarea
              rows="2"
              className="form-input"
              placeholder="Rua, número, bairro, cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '10px' }}>
            {editandoId ? 'Salvar alterações' : 'Salvar Cliente'}
          </button>
          {editandoId && (
            <button type="button" className="button-secondary" onClick={limparFormulario} style={{ width: '100%', marginTop: '8px' }}>
              Cancelar edição
            </button>
          )}
        </form>

        {/* Lista de clientes */}
        <div className="card">
          <span className="card-kicker">{clientes.length} {clientes.length === 1 ? 'CADASTRADO' : 'CADASTRADOS'}</span>
          <h3>Seus Clientes</h3>

          <div className="products-search" style={{ margin: '12px 0' }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {clientesFiltrados.length === 0 ? (
            <p style={{ color: 'var(--ink-faint)', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
              {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {clientesFiltrados.map((cliente) => {
                const peds = pedidosDoCliente(cliente);
                const totalComprado = peds.reduce((acc, p) => acc + valorDoPedido(p), 0);
                return (
                  <div
                    key={cliente.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--canvas)', border: '1px solid var(--line)', borderRadius: '10px', flexWrap: 'wrap' }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{cliente.nome}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                        {[cliente.telefone, cliente.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}
                      </div>
                      {cliente.endereco && (
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginTop: '2px' }}>{cliente.endereco}</div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--plum)' }}>
                        {peds.length} {peds.length === 1 ? 'pedido' : 'pedidos'} · {brl(totalComprado)}
                      </strong>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button type="button" onClick={() => iniciarEdicao(cliente)} style={{ color: 'var(--plum-dark)', fontWeight: '600', fontSize: '12px' }}>
                          Editar
                        </button>
                        <button type="button" onClick={() => excluirCliente(cliente)} style={{ color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}>
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Clientes;
