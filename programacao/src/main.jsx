import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './estilo/identidade.css'
import App from './App.jsx'

// A primeira tela só aparece com a fonte em pixel pronta (a tela de carregamento do site fica até lá): se ela chegasse
// depois, os botões mudariam de largura e os vizinhos sairiam do lugar. Sem a fonte em 2,5 s, segue com a do sistema.
const esperaPelaFonte = 2500
const fontePronta = Promise.race([
  document.fonts?.load('16px "Pixelify Sans"', 'Jogar Á') ?? Promise.resolve(),
  new Promise((resolver) => setTimeout(resolver, esperaPelaFonte)),
]).catch(() => {})

fontePronta.then(() =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
)
