import { coresDaArena } from '../../dados/arenaDeTeste.js'

// Base dos projéteis (flecha, bola mágica, tiro do atirador): uma bolinha que anda em linha reta.
// Cada projétil tem atualizar(agora, segundos), que devolve false quando acabou, e destruir().
export default class Projetil {
  constructor(cena, x, y, angulo, velocidade, raio, cor) {
    this.cena = cena
    this.x = x
    this.y = y
    this.angulo = angulo
    this.vx = Math.cos(angulo) * velocidade
    this.vy = Math.sin(angulo) * velocidade
    this.raio = raio
    this.percorrido = 0
    this.forma = cena.add.circle(x, y, raio, cor).setStrokeStyle(2, coresDaArena.contorno)
  }

  circulo() {
    return { x: this.x, y: this.y, raio: this.raio }
  }

  // Anda em passos de no máximo 10 px, para não atravessar nada quando é rápido.
  // "bateu" é chamada a cada passo e devolve true para parar.
  mover(segundos, bateu) {
    const passoTotal = Math.hypot(this.vx, this.vy) * segundos
    const passos = Math.max(1, Math.ceil(passoTotal / 10))
    for (let i = 0; i < passos; i++) {
      this.x += (this.vx * segundos) / passos
      this.y += (this.vy * segundos) / passos
      this.percorrido += passoTotal / passos
      if (bateu()) return true
    }
    return false
  }

  // Um ponto logo atrás do projétil: o empurrão vai na direção em que ele voava
  get origemDoEmpurrao() {
    return { x: this.x - Math.cos(this.angulo) * 20, y: this.y - Math.sin(this.angulo) * 20 }
  }

  desenhar() {
    this.forma.setPosition(this.x, this.y).setDepth(this.y + 5)
  }

  destruir() {
    this.forma.destroy()
  }
}
