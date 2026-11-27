import React, { useState, useEffect } from 'react';

const IMAGENS_CATEGORIA = {
  'Cerâmica': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
  'Macramê': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
  'Fibras naturais': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80',
  'Acessórios': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
};

// Imagem usada para categorias novas (criadas pelo usuário)
const IMAGEM_PADRAO = IMAGENS_CATEGORIA['Cerâmica'];

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Categorias (vindas do backend)
  const [categorias, setCategorias] = useState([]);
  const [modalCategorias, setModalCategorias] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Filtros e visualização
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [visualizacao, setVisualizacao] = useState('grade'); // 'grade' ou 'lista'
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = novo produto
  const [custoOriginal, setCustoOriginal] = useState(0); // custo já salvo, usado ao editar

  // Campos do Modal de Novo Produto
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precoFinalManual, setPrecoFinalManual] = useState(null); // null = usar o preço sugerido
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(5);
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  // Calculadora de Insumos e Mão de Obra
  const [insumosSelecionados, setInsumosSelecionados] = useState([]);
  const [insumoAtualId, setInsumoAtualId] = useState('');
  const [quantidadeAtual, setQuantidadeAtual] = useState('');
  const [horasTrabalho, setHorasTrabalho] = useState('');
  const [valorHora, setValorHora] = useState(25);
  const [margemLucro, setMargemLucro] = useState(50);

  const carregarDados = async () => {
    // Cada lista é buscada separadamente: se uma falhar, as outras continuam funcionando
    const buscar = async (url) => {
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

    const [listaProdutos, listaInsumos, listaPedidos, listaCategorias] = await Promise.all([
      buscar('http://localhost:8080/api/produtos'),
      buscar('http://localhost:8080/api/insumos'),
      buscar('http://localhost:8080/api/pedidos'),
      buscar('http://localhost:8080/api/categorias')
    ]);

    setProdutos(listaProdutos);
    setInsumosDisponiveis(listaInsumos);
    setPedidos(listaPedidos);
    setCategorias(listaCategorias);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Cálculos de precificação
  const adicionarInsumo = () => {
    if (!insumoAtualId || !quantidadeAtual) return;
    const insumoObj = insumosDisponiveis.find(i => i.id === parseInt(insumoAtualId));
    if (!insumoObj) return;

    if (insumosSelecionados.some(item => item.insumoId === insumoObj.id)) {
      alert('Este insumo já foi adicionado.');
      return;
    }

    setInsumosSelecionados([
      ...insumosSelecionados,
      {
        insumoId: insumoObj.id,
        nome: insumoObj.nome,
        precoUnitario: Number(insumoObj.custoUnitario) || 0,
        quantidade: parseFloat(quantidadeAtual)
      }
    ]);
    setInsumoAtualId('');
    setQuantidadeAtual('');
  };

  const removerInsumo = (id) => {
    setInsumosSelecionados(insumosSelecionados.filter(item => item.insumoId !== id));
  };

  const custoInsumosTotal = insumosSelecionados.reduce(
    (acc, item) => acc + item.quantidade * (item.precoUnitario || 0),
    0
  );
  const custoMaoDeObra = (parseFloat(horasTrabalho) || 0) * (parseFloat(valorHora) || 0);
  const custoProducaoTotal = custoInsumosTotal + custoMaoDeObra;
  // Ao editar sem mexer em insumos/horas, mantém o custo que já estava salvo
  const recalculando = insumosSelecionados.length > 0 || !!horasTrabalho;
  const custoBase = editandoId && !recalculando ? Number(custoOriginal) || 0 : custoProducaoTotal;
  const precoSugerido = custoBase * (1 + (parseFloat(margemLucro) || 0) / 100);

  // Categorias: criar e excluir
  const criarCategoria = async (e) => {
    e.preventDefault();
    const nomeLimpo = novaCategoria.trim();
    if (!nomeLimpo) return;

    try {
      const resposta = await fetch('http://localhost:8080/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeLimpo })
      });

      if (!resposta.ok) {
        alert(await resposta.text());
        return;
      }

      const criada = await resposta.json();
      setNovaCategoria('');
      setCategoria(criada.nome); // já deixa selecionada no formulário
      carregarDados();
    } catch (erro) {
      console.error('Erro ao criar categoria:', erro);
    }
  };

  const excluirCategoria = async (cat) => {
    if (!window.confirm(`Excluir a categoria "${cat.nome}"?`)) return;

    try {
      const resposta = await fetch(`http://localhost:8080/api/categorias/${cat.id}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) {
        alert(await resposta.text());
        return;
      }

      if (categoriaAtiva === cat.nome) setCategoriaAtiva('Todos');
      if (categoria === cat.nome) setCategoria('');
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir categoria:', erro);
    }
  };

  // Envia a foto escolhida para o backend e guarda o endereço dela no produto
  const enviarImagem = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    if (arquivo.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5 MB.');
      e.target.value = '';
      return;
    }

    setEnviandoImagem(true);
    try {
      const dados = new FormData();
      dados.append('arquivo', arquivo);

      const resposta = await fetch('http://localhost:8080/api/uploads', {
        method: 'POST',
        body: dados
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error('Resposta do servidor:', resposta.status, texto);
        alert(texto && texto.length < 200 ? texto : 'Erro ao enviar a imagem.');
        return;
      }

      const resultado = await resposta.json();
      setImagemUrl(resultado.url);
    } catch (erro) {
      console.error('Erro ao enviar imagem:', erro);
      alert('Não foi possível enviar a imagem. O backend está rodando?');
    } finally {
      setEnviandoImagem(false);
      e.target.value = '';
    }
  };

  const limparFormulario = () => {
    setNome('');
    setCategoria('');
    setPrecoFinalManual(null);
    setQuantidadeEstoque(5);
    setDescricao('');
    setImagemUrl('');
    setInsumosSelecionados([]);
    setHorasTrabalho('');
    setCustoOriginal(0);
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

  const abrirEdicao = (prod) => {
    limparFormulario();
    setEditandoId(prod.id);
    setNome(prod.nome || '');
    setCategoria(prod.categoria || '');
    setPrecoFinalManual(prod.precoFinal != null ? String(prod.precoFinal) : null);
    setQuantidadeEstoque(prod.quantidadeEstoque != null ? prod.quantidadeEstoque : 0);
    setDescricao(prod.descricao || '');
    setImagemUrl(prod.imagemUrl || '');
    setCustoOriginal(prod.custoInsumos || 0);
    setModalAberto(true);
  };

  const excluirProduto = async (prod) => {
    if (!window.confirm(`Excluir o produto "${prod.nome}"?`)) return;
    try {
      const resposta = await fetch(`http://localhost:8080/api/produtos/${prod.id}`, { method: 'DELETE' });
      if (!resposta.ok) {
        const texto = await resposta.text();
        alert(resposta.status === 409 && texto ? texto : 'Erro ao excluir o produto.');
        return;
      }
      carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir produto:', erro);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const precoDefinido = parseFloat(
      precoFinalManual === null ? precoSugerido.toFixed(2) : precoFinalManual
    ) || 0;

    if (precoDefinido <= 0) {
      alert('Informe o preço de venda (ou preencha insumos/horas para calcular o sugerido).');
      return;
    }

    const novoProduto = {
      nome,
      categoria,
      custoInsumos: parseFloat(custoBase.toFixed(2)),
      precoFinal: precoDefinido,
      quantidadeEstoque: parseInt(quantidadeEstoque) || 0,
      descricao,
      imagemUrl: imagemUrl || IMAGENS_CATEGORIA[categoria] || IMAGEM_PADRAO
    };

    try {
      const url = editandoId
        ? `http://localhost:8080/api/produtos/${editandoId}`
        : 'http://localhost:8080/api/produtos';

      const resposta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProduto),
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        console.error('Resposta do servidor:', resposta.status, texto);
        alert(`Erro ao cadastrar produto! (código ${resposta.status}). Veja o console do backend.`);
        return;
      }

      fecharModal();
      carregarDados();
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      alert('Não foi possível falar com o servidor.');
    }
  };

  const produtosEnriquecidos = produtos.map((prod) => {
    const cat = prod.categoria || 'Sem categoria';
    const estoque = prod.quantidadeEstoque !== undefined && prod.quantidadeEstoque !== null ? prod.quantidadeEstoque : 5;
    // Soma as unidades vendidas deste produto em todos os itens de todos os pedidos
    const vendidos = pedidos.reduce((acc, p) => {
      const itens = p.itens && p.itens.length > 0
        ? p.itens
        : [{ produtoId: p.produtoId, quantidade: p.quantidade }]; // pedidos antigos
      return acc + itens
        .filter(i => i.produtoId === prod.id)
        .reduce((soma, i) => soma + (i.quantidade || 1), 0);
    }, 0);

    return {
      ...prod,
      categoriaExibicao: cat,
      estoqueExibicao: estoque,
      vendidosExibicao: vendidos,
      fotoExibicao: prod.imagemUrl || IMAGENS_CATEGORIA[cat] || IMAGEM_PADRAO,
      descricaoExibicao: prod.descricao || 'Peça artesanal produzida manualmente com acabamento exclusivo do ateliê.'
    };
  });

  // Indicadores superiores
  const totalAtivos = produtosEnriquecidos.length;
  const estoqueBaixoCount = produtosEnriquecidos.filter(p => p.estoqueExibicao <= 3).length;
  const valorTotalEstoque = produtosEnriquecidos.reduce(
    (acc, p) => acc + (p.custoInsumos || p.precoFinal * 0.5 || 0) * p.estoqueExibicao,
    0
  );
  const maisVendido = [...produtosEnriquecidos].sort((a, b) => b.vendidosExibicao - a.vendidosExibicao)[0];

  // Filtragem
  const produtosFiltrados = produtosEnriquecidos.filter(prod => {
    const termo = busca.toLowerCase();
    const matchBusca =
      (prod.nome || '').toLowerCase().includes(termo) ||
      prod.categoriaExibicao.toLowerCase().includes(termo);
    const matchCategoria = categoriaAtiva === 'Todos' || prod.categoriaExibicao === categoriaAtiva;
    return matchBusca && matchCategoria;
  });

  return (
    <div className="products-page">
      {/* Cabeçalho */}
      <div className="welcome">
        <div>
          <span className="eyebrow">SEU CATÁLOGO</span>
          <h1>Produtos</h1>
          <p>Cuide das suas peças, preços e materiais em um só lugar.</p>
        </div>
        <button className="button-primary" onClick={abrirNovo}>
          + Novo produto
        </button>
      </div>

      {/* Painel de 4 Quadrantes */}
      <div className="products-summary-box">
        <div className="summary-quadrant">
          <span>Produtos ativos</span>
          <div className="summary-value-row">
            <strong>{totalAtivos}</strong>
            <small>cadastrado</small>
          </div>
        </div>

        <div className="summary-quadrant">
          <span>Estoque baixo</span>
          <div className="summary-value-row">
            <strong>{estoqueBaixoCount}</strong>
            <small className={estoqueBaixoCount > 0 ? 'alert-text' : ''}>
              {estoqueBaixoCount > 0 ? 'precisam de atenção' : 'estoque saudável'}
            </small>
          </div>
        </div>

        <div className="summary-quadrant">
          <span>Valor em estoque</span>
          <div className="summary-value-row">
            <strong>R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <small>custo</small>
          </div>
        </div>

        <div className="summary-quadrant">
          <span>Mais vendido</span>
          <div className="summary-value-row">
            <strong>{maisVendido ? maisVendido.nome : '—'}</strong>
            <small>{maisVendido ? `${maisVendido.vendidosExibicao} unidades` : 'sem vendas'}</small>
          </div>
        </div>
      </div>

      {/* Barra de Busca, Filtros de Categoria e Alternância Grade/Lista */}
      <div className="products-controls">
        <div className="products-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por produto ou categoria"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {['Todos', ...categorias.map(c => c.nome)].map((cat) => (
            <button
              key={cat}
              className={`category-pill ${categoriaAtiva === cat ? 'active' : ''}`}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat}
            </button>
          ))}
          <button className="category-pill" onClick={() => setModalCategorias(true)}>
            ⚙ Gerenciar
          </button>
        </div>

        <div className="view-toggle" title="Alternar visualização">
          <button
            className={visualizacao === 'grade' ? 'active' : ''}
            onClick={() => setVisualizacao('grade')}
            aria-label="Visualização em grade"
          >
            ⊞
          </button>
          <button
            className={visualizacao === 'lista' ? 'active' : ''}
            onClick={() => setVisualizacao('lista')}
            aria-label="Visualização em lista"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Exibição dos Produtos (Grade ou Lista) */}
      {produtosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-faint)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏺</div>
          <strong style={{ color: 'var(--ink)', fontSize: '15px' }}>Nenhum produto encontrado</strong>
          <p style={{ margin: '6px 0 0', fontSize: '12.5px' }}>
            Cadastre uma nova peça artesanal ou ajuste os filtros acima.
          </p>
        </div>
      ) : visualizacao === 'grade' ? (
        <div className="products-grid">
          {produtosFiltrados.map((prod) => {
            const estoqueBaixo = prod.estoqueExibicao <= 3;
            return (
              <article key={prod.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={prod.fotoExibicao} alt={prod.nome} />
                  {estoqueBaixo ? (
                    <span className="product-badge low-stock">Estoque baixo ({prod.estoqueExibicao} un)</span>
                  ) : (
                    <span className="product-badge">Destaque</span>
                  )}
                </div>

                <div className="product-card-body">
                  <span className="product-category-tag">{prod.categoriaExibicao}</span>
                  <h3>{prod.nome}</h3>
                  <p className="product-desc">{prod.descricaoExibicao}</p>

                  <div className="product-meta-footer">
                    <div className="product-price">
                      <strong>R$ {Number(prod.precoFinal || 0).toFixed(2)}</strong>
                      <small>Custo: R$ {Number(prod.custoInsumos || 0).toFixed(2)}</small>
                    </div>

                    <div className="product-stats-pills">
                      <span className={`stock-indicator ${estoqueBaixo ? 'low' : ''}`}>
                        {estoqueBaixo ? `⚠️ ${prod.estoqueExibicao} em estoque` : `✓ ${prod.estoqueExibicao} em estoque`}
                      </span>
                      <span style={{ color: 'var(--ink-faint)' }}>{prod.vendidosExibicao} vendidos</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                    <button type="button" onClick={() => abrirEdicao(prod)} style={{ color: 'var(--plum-dark)', fontWeight: '600', fontSize: '12px' }}>
                      Editar
                    </button>
                    <button type="button" onClick={() => excluirProduto(prod)} style={{ color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}>
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="orders-management">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Custo</th>
                <th>Estoque</th>
                <th>Vendidos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((prod) => {
                const estoqueBaixo = prod.estoqueExibicao <= 3;
                return (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.fotoExibicao}
                          alt={prod.nome}
                          style={{ width: '42px', height: '42px', borderRadius: '9px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--ink)' }}>{prod.nome}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-faint)' }}>
                            {prod.descricaoExibicao}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{prod.categoriaExibicao}</td>
                    <td><strong style={{ color: 'var(--plum-dark)' }}>R$ {Number(prod.precoFinal || 0).toFixed(2)}</strong></td>
                    <td>R$ {Number(prod.custoInsumos || 0).toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: estoqueBaixo ? 'var(--clay-soft)' : 'var(--sage-soft)',
                          color: estoqueBaixo ? 'var(--clay)' : 'var(--sage)'
                        }}
                      >
                        {prod.estoqueExibicao} un {estoqueBaixo ? '(Baixo)' : ''}
                      </span>
                    </td>
                    <td>{prod.vendidosExibicao} un</td>
                    <td>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => abrirEdicao(prod)} style={{ color: 'var(--plum-dark)', fontWeight: '600', fontSize: '12px' }}>
                          Editar
                        </button>
                        <button type="button" onClick={() => excluirProduto(prod)} style={{ color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro de Novo Produto */}
      {modalAberto && (
        <div className="modal-layer">
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">CATÁLOGO ARTESANAL</span>
                <h2>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>
              </div>
              <button onClick={fecharModal} style={{ fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Nome do Produto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Caneca Botânica"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categoria</label>
                  <select
                    className="form-input"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                  {categorias.length === 0 && (
                    <small style={{ display: 'block', color: 'var(--clay)', marginTop: '4px' }}>
                      Nenhuma categoria cadastrada. Crie uma para poder salvar o produto.
                    </small>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalCategorias(true)}
                    style={{ fontSize: '11.5px', marginTop: '4px', color: 'var(--plum-dark)' }}
                  >
                    + Nova categoria
                  </button>
                </div>
              </div>

              {/* Composição automática de insumos */}
              <div className="form-group">
                <label>Insumos utilizados (Cálculo automático de custo)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={insumoAtualId}
                    onChange={(e) => setInsumoAtualId(e.target.value)}
                    className="form-input"
                    style={{ flex: 2 }}
                  >
                    <option value="">Selecionar material do estoque...</option>
                    {insumosDisponiveis.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.nome} (R$ {ins.custoUnitario || 0})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Qtd"
                    value={quantidadeAtual}
                    onChange={(e) => setQuantidadeAtual(e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={adicionarInsumo} className="button-primary" style={{ padding: '0 14px' }}>
                    +
                  </button>
                </div>
              </div>

              {insumosSelecionados.length > 0 && (
                <div style={{ background: 'var(--canvas)', border: '1px solid var(--line)', borderRadius: '10px', padding: '10px 12px' }}>
                  {insumosSelecionados.map((item) => (
                    <div key={item.insumoId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                      <span>{item.quantidade}x {item.nome}</span>
                      <button type="button" onClick={() => removerInsumo(item.insumoId)} style={{ color: 'var(--clay)', fontWeight: '600' }}>
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Horas de Produção</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    placeholder="Ex: 3"
                    value={horasTrabalho}
                    onChange={(e) => setHorasTrabalho(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Valor/Hora (R$)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={valorHora}
                    onChange={(e) => setValorHora(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Margem (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Custo de Produção (R$)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`R$ ${custoBase.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Venda (Sugerido: R$ {precoSugerido.toFixed(2)})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={precoFinalManual === null ? (precoSugerido > 0 ? precoSugerido.toFixed(2) : '') : precoFinalManual}
                    onChange={(e) => setPrecoFinalManual(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantidade em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={quantidadeEstoque}
                    onChange={(e) => setQuantidadeEstoque(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Foto do produto (opcional)</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {imagemUrl ? (
                    <img
                      src={imagemUrl}
                      alt="Prévia da foto"
                      style={{ width: '76px', height: '76px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--line)' }}
                    />
                  ) : (
                    <div style={{ width: '76px', height: '76px', borderRadius: '10px', border: '1px dashed var(--line)', display: 'grid', placeItems: 'center', fontSize: '11px', color: 'var(--ink-faint)', textAlign: 'center' }}>
                      Sem foto
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={enviarImagem}
                      disabled={enviandoImagem}
                    />
                    {enviandoImagem && (
                      <small style={{ display: 'block', color: 'var(--ink-faint)', marginTop: '4px' }}>Enviando foto...</small>
                    )}
                    {imagemUrl && !enviandoImagem && (
                      <button
                        type="button"
                        onClick={() => setImagemUrl('')}
                        style={{ display: 'block', marginTop: '6px', color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
                <small style={{ display: 'block', marginTop: '6px', color: 'var(--ink-faint)' }}>
                  JPG, PNG, GIF ou WEBP, até 5 MB. Sem foto, o sistema usa a imagem padrão da categoria.
                </small>
              </div>

              <div className="form-group">
                <label>Descrição da Peça</label>
                <textarea
                  rows="2"
                  className="form-input"
                  placeholder="Detalhes sobre tamanho, acabamento, materiais..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button-secondary" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="button-primary">
                  {editandoId ? 'Salvar alterações' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categorias */}
      {modalCategorias && (
        <div className="modal-layer" style={{ zIndex: 1100 }}>
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">CATÁLOGO ARTESANAL</span>
                <h2>Categorias</h2>
              </div>
              <button onClick={() => setModalCategorias(false)} style={{ fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={criarCategoria} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Crochê, Bordado, Velas..."
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="button-primary">Adicionar</button>
            </form>

            {categorias.length === 0 ? (
              <p style={{ color: 'var(--ink-faint)', fontSize: '12.5px' }}>Nenhuma categoria cadastrada ainda.</p>
            ) : (
              <div style={{ background: 'var(--canvas)', border: '1px solid var(--line)', borderRadius: '10px', padding: '10px 12px' }}>
                {categorias.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0' }}>
                    <span>{c.nome}</span>
                    <button type="button" onClick={() => excluirCategoria(c)} style={{ color: 'var(--clay)', fontWeight: '600' }}>
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setModalCategorias(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Produtos;