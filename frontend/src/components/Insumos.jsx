import React, { useState, useEffect } from 'react';
import { estoqueBaixo, limiteDoInsumo } from '../utils/estoque';

const UNIDADES = ['un', 'm', 'cm', 'g', 'kg', 'ml', 'l', 'novelo', 'rolo', 'folha'];

function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [nome, setNome] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('un');
  const [custoUnitario, setCustoUnitario] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [editandoId, setEditandoId] = useState(null); // null = cadastrando novo

  const carregarInsumos = async () => {
    try {
      const resposta = await fetch('http://localhost:8080/api/insumos');
      const dados = await resposta.json();
      setInsumos(dados);
    } catch (erro) {
      console.error('Erro ao buscar insumos:', erro);
    }
  };

  useEffect(() => {
    carregarInsumos();
  }, []);

  const limparFormulario = () => {
    setNome('');
    setUnidadeMedida('un');
    setCustoUnitario('');
    setQuantidadeEstoque('');
    setEstoqueMinimo('');
    setEditandoId(null);
  };

  const iniciarEdicao = (ins) => {
    setEditandoId(ins.id);
    setNome(ins.nome || '');
    setUnidadeMedida(ins.unidadeMedida || 'un');
    setCustoUnitario(ins.custoUnitario != null ? String(ins.custoUnitario) : '');
    setQuantidadeEstoque(ins.quantidadeEstoque != null ? String(ins.quantidadeEstoque) : '');
    setEstoqueMinimo(ins.estoqueMinimo != null ? String(ins.estoqueMinimo) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirInsumo = async (ins) => {
    if (!window.confirm(`Excluir o insumo "${ins.nome}"?`)) return;
    try {
      const resposta = await fetch(`http://localhost:8080/api/insumos/${ins.id}`, { method: 'DELETE' });
      if (!resposta.ok) {
        alert('Erro ao excluir o insumo.');
        return;
      }
      if (editandoId === ins.id) limparFormulario();
      carregarInsumos();
    } catch (erro) {
      console.error('Erro ao excluir insumo:', erro);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Os nomes dos campos precisam ser iguais aos do backend (Insumo.java)
    const novoInsumo = {
      nome,
      unidadeMedida,
      custoUnitario: parseFloat(custoUnitario),
      quantidadeEstoque: parseFloat(quantidadeEstoque),
      estoqueMinimo: estoqueMinimo === '' ? null : parseFloat(estoqueMinimo)
    };

    try {
      const url = editandoId
        ? `http://localhost:8080/api/insumos/${editandoId}`
        : 'http://localhost:8080/api/insumos';

      const resposta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoInsumo),
      });

      if (!resposta.ok) {
        console.error('Resposta do servidor:', resposta.status, await resposta.text());
        alert('Erro ao salvar insumo! Veja o console do backend.');
        return;
      }

      limparFormulario();
      carregarInsumos();
    } catch (erro) {
      console.error('Erro ao salvar insumo:', erro);
      alert('Não foi possível falar com o servidor.');
    }
  };

  const insumosBaixos = insumos.filter(estoqueBaixo);

  return (
    <div>
      <div className="welcome">
        <div>
          <span className="eyebrow">ESTOQUE DE MATERIAIS</span>
          <h1>Gerenciamento de Insumos</h1>
          <p>Cadastre fios, tecidos, aviamentos e matérias-primas do seu ateliê.</p>
        </div>
      </div>

      {/* Alerta de estoque baixo */}
      {insumosBaixos.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(145deg, #c66f55, #b05f48)',
            color: '#fff',
            borderRadius: '18px',
            padding: '18px 22px',
            marginBottom: '20px'
          }}
        >
          <span style={{ fontSize: '10px', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.85 }}>
            ATENÇÃO AO ESTOQUE
          </span>
          <strong style={{ display: 'block', fontSize: '17px', margin: '4px 0 12px' }}>
            {insumosBaixos.length === 1
              ? '1 material está acabando'
              : `${insumosBaixos.length} materiais estão acabando`}
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {insumosBaixos.map((ins) => (
              <span
                key={ins.id}
                style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '999px', padding: '5px 12px', fontSize: '12px', fontWeight: 600 }}
              >
                {ins.nome} · {ins.quantidadeEstoque} {ins.unidadeMedida}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', alignItems: 'start' }}>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="card">
          <span className="card-kicker">{editandoId ? 'EDITANDO ITEM' : 'NOVO ITEM'}</span>
          <h3>{editandoId ? 'Editar Insumo' : 'Cadastrar Insumo'}</h3>

          <div className="form-group">
            <label>Nome do Insumo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Fio Amigurumi"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Unidade de Medida</label>
            <select
              className="form-input"
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              required
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Custo por {unidadeMedida} (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="Ex: 15.00"
              value={custoUnitario}
              onChange={(e) => setCustoUnitario(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantidade em Estoque ({unidadeMedida})</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-input"
              placeholder="Ex: 10"
              value={quantidadeEstoque}
              onChange={(e) => setQuantidadeEstoque(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Avisar quando restar ({unidadeMedida})</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="form-input"
              placeholder="Ex: 3 (vazio = avisar com 5 ou menos)"
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(e.target.value)}
            />
          </div>

          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '10px' }}>
            {editandoId ? 'Salvar alterações' : 'Salvar Insumo'}
          </button>
          {editandoId && (
            <button type="button" className="button-secondary" onClick={limparFormulario} style={{ width: '100%', marginTop: '8px' }}>
              Cancelar edição
            </button>
          )}
        </form>

        {/* Lista de Insumos */}
        <div className="card">
          <span className="card-kicker">DISPONÍVEIS</span>
          <h3>Insumos Cadastrados</h3>

          {insumos.length === 0 ? (
            <p style={{ color: 'var(--ink-faint)', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
              Nenhum insumo cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              {insumos.map((ins) => {
                const baixo = estoqueBaixo(ins);
                return (
                <div key={ins.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: baixo ? 'var(--clay-soft)' : 'var(--canvas)', border: `1px solid ${baixo ? 'var(--clay)' : 'var(--line)'}`, borderRadius: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{ins.nome}</strong>
                    {baixo && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, background: 'var(--clay)', color: '#fff' }}>
                        Estoque baixo
                      </span>
                    )}
                    <div style={{ fontSize: '12px', color: baixo ? 'var(--clay)' : 'var(--ink-faint)', marginTop: '2px' }}>
                      Estoque: {ins.quantidadeEstoque} {ins.unidadeMedida} · avisar em {limiteDoInsumo(ins)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--plum)' }}>
                      R$ {Number(ins.custoUnitario || 0).toFixed(2)} / {ins.unidadeMedida}
                    </strong>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button type="button" onClick={() => iniciarEdicao(ins)} style={{ color: 'var(--plum-dark)', fontWeight: '600', fontSize: '12px' }}>
                        Editar
                      </button>
                      <button type="button" onClick={() => excluirInsumo(ins)} style={{ color: 'var(--clay)', fontWeight: '600', fontSize: '12px' }}>
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

export default Insumos;
