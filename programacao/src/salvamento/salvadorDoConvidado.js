import { chaves } from './chaves.js'
import { criarSalvadorLocal } from './salvadorLocal.js'

// Lê e grava o progresso do convidado no navegador (RF01, RF09, RF11, RF12, RNF06).
// É o salvador local (salvadorLocal.js) com a chave do convidado; a cópia local de cada conta usa o mesmo salvador.
// armazenamento: vem de armazenamento.js, ou é null quando o navegador não deixa guardar nada.
// agora: devolve a data atual (dá para trocar nos testes).
export function criarSalvadorDoConvidado(armazenamento, agora = () => new Date()) {
  return criarSalvadorLocal(armazenamento, { chave: chaves.convidado, chaveCorrompida: chaves.convidadoCorrompido, perfil: 'convidado' }, agora)
}

// A cópia local do save de uma conta (Fase 2): mesmas regras, chave da conta
export function criarSalvadorDaConta(armazenamento, idDaConta, agora = () => new Date()) {
  return criarSalvadorLocal(armazenamento, { chave: chaves.conta(idDaConta), chaveCorrompida: chaves.contaCorrompida(idDaConta), perfil: 'conta' }, agora)
}
