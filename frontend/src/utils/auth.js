// Login de DEMONSTRAÇÃO (só no navegador).
// Serve para mostrar o fluxo de entrada e proteger as telas do sistema na apresentação.
// Não é segurança de verdade: para produção, o login precisa ser validado no backend.

export const CONTA_DEMO = {
  email: 'demo@conectaartesa.com',
  senha: '123456'
};

const CHAVE = 'conectaartesa_sessao';
let sessaoEmMemoria = false; // garante o login mesmo se o navegador bloquear o localStorage

export function estaLogado() {
  if (sessaoEmMemoria) return true;
  try {
    return window.localStorage.getItem(CHAVE) === 'ativa';
  } catch (erro) {
    return false;
  }
}

export function entrar(email, senha) {
  const valido =
    email.trim().toLowerCase() === CONTA_DEMO.email && senha === CONTA_DEMO.senha;
  if (!valido) return false;

  sessaoEmMemoria = true;
  try {
    window.localStorage.setItem(CHAVE, 'ativa');
  } catch (erro) {
    // sem localStorage: a sessão fica só na memória
  }
  return true;
}

export function sair() {
  sessaoEmMemoria = false;
  try {
    window.localStorage.removeItem(CHAVE);
  } catch (erro) {
    // nada a fazer
  }
}
