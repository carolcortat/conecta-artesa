import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import logo from '../utils/logo';

const MATERIAIS = 22;   // custo de insumos do exemplo (R$)
const VALOR_HORA = 25;  // valor da hora de trabalho do exemplo (R$)

const brl = (v) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const icone = (children) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const RECURSOS = [
  {
    titulo: 'Preço certo para cada peça',
    texto: 'Some insumos, horas de trabalho e margem de lucro. O sistema sugere quanto cobrar, e você ajusta se quiser.',
    icone: icone(<><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></>)
  },
  {
    titulo: 'Aviso de material acabando',
    texto: 'Defina o estoque mínimo de cada insumo. Quando ele chega no limite, o alerta aparece na tela inicial.',
    icone: icone(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>)
  },
  {
    titulo: 'Encomendas organizadas',
    texto: 'Vários produtos por pedido, data de entrega, observações e status: novo, em produção, pronto e entregue.',
    icone: icone(<><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 14l2 2 4-4" /></>)
  },
  {
    titulo: 'Catálogo com fotos',
    texto: 'Cadastre produtos por categoria e envie a foto de cada peça direto do computador.',
    icone: icone(<><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>)
  },
  {
    titulo: 'Clientes e histórico',
    texto: 'Guarde contato e endereço e veja quantos pedidos cada cliente já fez e quanto comprou.',
    icone: icone(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>)
  },
  {
    titulo: 'Dinheiro sob controle',
    texto: 'Veja quanto já entrou, quanto falta receber e como as clientes pagam: Pix, cartão ou dinheiro.',
    icone: icone(<><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></>)
  }
];

const PASSOS = [
  { t: 'Cadastre seus materiais', p: 'Informe custo, unidade e estoque mínimo de cada insumo.' },
  { t: 'Monte seus produtos', p: 'Use a calculadora para chegar ao preço de venda e adicione a foto.' },
  { t: 'Registre os pedidos', p: 'Escolha a cliente, os produtos e a data de entrega.' },
  { t: 'Acompanhe e receba', p: 'Mude o status, dê baixa no estoque e marque o pagamento recebido.' }
];

const PLANOS = [
  {
    nome: 'Semente', para: 'Para quem está começando a organizar o ateliê.',
    preco: '0', destaque: false, botao: 'Começar de graça',
    itens: ['Até 15 produtos', 'Até 20 pedidos por mês', 'Cadastro de insumos e clientes', 'Calculadora de preço']
  },
  {
    nome: 'Ateliê', para: 'Para quem já vende toda semana e quer controle.',
    preco: '29', destaque: true, botao: 'Quero o plano Ateliê',
    itens: ['Produtos ilimitados', 'Pedidos ilimitados', 'Alerta de estoque baixo', 'Controle financeiro completo', 'Fotos dos produtos']
  },
  {
    nome: 'Loja', para: 'Para ateliês com equipe ou várias linhas de produto.',
    preco: '59', destaque: false, botao: 'Falar sobre o Loja',
    itens: ['Tudo do plano Ateliê', 'Até 3 usuários', 'Relatórios mensais', 'Suporte por WhatsApp']
  }
];

const DEPOIMENTOS = [
  {
    grande: true, nome: 'Marina Duarte', info: 'Crochê e amigurumi, Belo Horizonte', cor: '#6f3e5e',
    texto: 'Eu vendia uma bolsa por R$ 60 sem saber que gastava R$ 58 só de linha e tempo. Depois da calculadora, passei a cobrar o que realmente vale.'
  },
  {
    nome: 'Joana Pires', info: 'Cerâmica, Florianópolis', cor: '#668476',
    texto: 'O aviso de estoque baixo me salvou numa semana de encomenda grande. Percebi que o esmalte ia acabar antes de começar a queimar.'
  },
  {
    nome: 'Lúcia Fernandes', info: 'Velas e sabonetes, Recife', cor: '#c66f55',
    texto: 'Antes eu anotava os pedidos no caderno e esquecia quem já tinha pago. Agora vejo tudo que falta receber em uma tela só.'
  }
];

const PERGUNTAS = [
  { q: 'Preciso saber usar computador?', a: 'Não precisa de conhecimento técnico. As telas seguem o caminho do dia a dia: cadastrar material, montar o produto, anotar o pedido.' },
  { q: 'Posso usar no celular?', a: 'Hoje o sistema roda no navegador do computador. A versão para celular é um dos próximos passos do projeto.' },
  { q: 'Meus dados ficam seguros?', a: 'Os dados ficam no banco de dados do sistema. Nesta versão de demonstração o login é simulado; autenticação completa está prevista para a próxima etapa.' },
  { q: 'Posso trocar de plano depois?', a: 'Sim. Você pode subir ou descer de plano a qualquer momento, sem multa.' },
  { q: 'Os planos e depoimentos são reais?', a: 'Não. Este é um projeto acadêmico (MVP): valores e depoimentos desta página são fictícios e servem apenas para a apresentação.' }
];

function Landing() {
  const [horas, setHoras] = useState(2);
  const [margem, setMargem] = useState(50);

  const custo = MATERIAIS + horas * VALOR_HORA;
  const preco = custo * (1 + margem / 100);

  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-wrap lp-header-inner">
          <a href="#topo" className="lp-brand" aria-label="ConectaArtesã">
            <img src={logo} alt="ConectaArtesã" />
          </a>
          <nav className="lp-nav" aria-label="Seções da página">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
            <a href="#perguntas">Perguntas</a>
          </nav>
          <Link to="/login" className="lp-btn lp-btn-primary lp-btn-small">Entrar</Link>
        </div>
      </header>

      <main id="topo">
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div>
              <h1>Saiba quanto cobrar pelo que você faz com as mãos.</h1>
              <p className="lp-lead">
                O ConectaArtesã reúne preço, materiais, encomendas, clientes e dinheiro
                do seu ateliê em um só lugar, sem caderno nem planilha solta.
              </p>
              <div className="lp-hero-actions">
                <Link to="/login" className="lp-btn lp-btn-primary">Experimentar agora</Link>
                <a href="#recursos" className="lp-btn lp-btn-ghost">Ver recursos</a>
              </div>
              <p className="lp-hero-note">Teste sem cadastro com a conta de demonstração.</p>
            </div>

            <div className="lp-tag-area">
              <div className="lp-tag">
                <div className="lp-tag-body">
                  <p className="lp-tag-context">Exemplo: bolsa de crochê</p>
                  <h2 className="lp-tag-title">Preço de venda</h2>

                  <div className="lp-tag-row"><span>Materiais</span><strong>{brl(MATERIAIS)}</strong></div>

                  <div className="lp-slider">
                    <label htmlFor="horas"><span>Horas de trabalho</span><strong>{String(horas).replace('.', ',')} h</strong></label>
                    <input id="horas" type="range" min="1" max="8" step="0.5" value={horas}
                           onChange={(e) => setHoras(Number(e.target.value))} />
                  </div>

                  <div className="lp-slider">
                    <label htmlFor="margem"><span>Margem de lucro</span><strong>{margem}%</strong></label>
                    <input id="margem" type="range" min="20" max="100" step="5" value={margem}
                           onChange={(e) => setMargem(Number(e.target.value))} />
                  </div>

                  <div className="lp-tag-row"><span>Custo total</span><strong>{brl(custo)}</strong></div>

                  <div className="lp-tag-total">
                    <span>Cobrar</span>
                    <strong aria-live="polite">{brl(preco)}</strong>
                  </div>
                  <p className="lp-tag-hint">Mexa nos controles. Considera hora de trabalho a {brl(VALOR_HORA)}.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Tudo o que o ateliê precisa, sem complicação</h2>
              <p>Seis áreas que conversam entre si: o pedido baixa o estoque, e o pagamento aparece no financeiro.</p>
            </div>
            <div className="lp-features">
              {RECURSOS.map((r) => (
                <article key={r.titulo} className="lp-feature">
                  {r.icone}
                  <h3>{r.titulo}</h3>
                  <p>{r.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="lp-section lp-steps-band">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Do material ao pagamento em quatro passos</h2>
              <p>Um caminho simples, na ordem em que o trabalho acontece.</p>
            </div>
            <ol className="lp-steps">
              {PASSOS.map((p, i) => (
                <li key={p.t} className="lp-step">
                  <span className="lp-step-number">{i + 1}</span>
                  <h3>{p.t}</h3>
                  <p>{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="planos" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Planos que crescem com o seu ateliê</h2>
              <p>Comece de graça e mude quando fizer sentido.</p>
            </div>
            <div className="lp-plans">
              {PLANOS.map((pl) => (
                <article key={pl.nome} className={pl.destaque ? 'lp-plan lp-plan-destaque' : 'lp-plan'}>
                  {pl.destaque && <span className="lp-plan-badge">Recomendado</span>}
                  <h3>{pl.nome}</h3>
                  <p className="lp-plan-for">{pl.para}</p>
                  <div className="lp-price"><strong>R$ {pl.preco}</strong><span>/mês</span></div>
                  <ul>{pl.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                  <Link to="/login" className={pl.destaque ? 'lp-btn lp-btn-light' : 'lp-btn lp-btn-ghost'}>{pl.botao}</Link>
                </article>
              ))}
            </div>
            <p className="lp-footnote">Valores fictícios, apenas para demonstração do projeto.</p>
          </div>
        </section>

        <section id="depoimentos" className="lp-section lp-testimonials-band">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2>Quem já organizou o ateliê</h2>
              <p>Depoimentos fictícios, criados para a apresentação.</p>
            </div>
            <div className="lp-quotes">
              {DEPOIMENTOS.map((d) => (
                <figure key={d.nome} className={d.grande ? 'lp-quote lp-quote-grande' : 'lp-quote'}>
                  <blockquote>“{d.texto}”</blockquote>
                  <figcaption>
                    <span className="lp-avatar" style={{ background: d.cor }} aria-hidden="true">
                      {d.nome.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <div><strong>{d.nome}</strong><span>{d.info}</span></div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="perguntas" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head"><h2>Perguntas frequentes</h2></div>
            <div className="lp-faq">
              {PERGUNTAS.map((p) => (
                <details key={p.q}><summary>{p.q}</summary><p>{p.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-wrap lp-cta-inner">
            <div>
              <h2>Pronta para organizar seu ateliê?</h2>
              <p>Entre com a conta de demonstração e explore o sistema completo.</p>
            </div>
            <Link to="/login" className="lp-btn lp-btn-light">Entrar no sistema</Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <span>© {new Date().getFullYear()} ConectaArtesã · Projeto acadêmico (MVP)</span>
          <nav aria-label="Rodapé">
            <a href="#recursos">Recursos</a>
            <a href="#planos">Planos</a>
            <Link to="/login">Entrar</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Landing;