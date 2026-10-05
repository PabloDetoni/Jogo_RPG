import ConfirmeEmail from './acesso/ConfirmeEmail.jsx'
import CriarConta from './acesso/CriarConta.jsx'
import EsqueciSenha from './acesso/EsqueciSenha.jsx'
import Login from './acesso/Login.jsx'
import NarrativaInicial from './acesso/NarrativaInicial.jsx'
import SelecaoClasse from './acesso/SelecaoClasse.jsx'
import TelaInicial from './acesso/TelaInicial.jsx'
import CutsceneDerrota from './partida/CutsceneDerrota.jsx'
import Mapa from './partida/Mapa.jsx'
import Minijogo from './partida/Minijogo.jsx'
import Partida from './partida/Partida.jsx'
import PontoPartida from './partida/PontoPartida.jsx'
import Preparacao from './partida/Preparacao.jsx'
import Resumo from './partida/Resumo.jsx'
import ArvoresHabilidades from './reino/ArvoresHabilidades.jsx'
import Forja from './reino/Forja.jsx'
import Guilda from './reino/Guilda.jsx'
import Mercado from './reino/Mercado.jsx'
import Mochila from './reino/Mochila.jsx'
import Reino from './reino/Reino.jsx'
import SalaoGloria from './reino/SalaoGloria.jsx'

// Qual componente desenhar para cada tela de dados/telas.js
export const componentesDasTelas = {
  telaInicial: TelaInicial,
  login: Login,
  criarConta: CriarConta,
  confirmeEmail: ConfirmeEmail,
  esqueciSenha: EsqueciSenha,
  narrativaInicial: NarrativaInicial,
  selecaoClasse: SelecaoClasse,

  reino: Reino,
  guilda: Guilda,
  mercado: Mercado,
  forja: Forja,
  mochila: Mochila,
  arvores: ArvoresHabilidades,
  salaoGloria: SalaoGloria,

  mapa: Mapa,
  fazenda: Minijogo,
  mina: Minijogo,
  lago: Minijogo,
  pontoPartida: PontoPartida,
  preparacao: Preparacao,
  partida: Partida,
  cutsceneDerrota: CutsceneDerrota,
  resumo: Resumo,
}
