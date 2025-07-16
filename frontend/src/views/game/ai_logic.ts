import { rightPaddle } from "./paddle"
import { ballSize, ball, speed as baseSpeed } from "./ball"
import { paddleHeight } from "./paddle";
import { aiDifficulty } from "./game";


let lastAiUpdate = Date.now()
let previousTargetY = 0
let nextTargetY = 0

export function resetIA() {

}

/*
  Simule la trajectoire de la balle avec sa position et sa vitesse:
    - Copie les positions x et y puis les vitesses vx, vy.
    - Tant que la balle va à droite et que x est à gauche du paddle de l'IA.
    - Calcul du temps pour que la balle atteigne le haut (y=0) ou le bas (y=canvasHeight - ballSize):
      - Si vy > 0 (se dirige vers le bas), timeToWall = (bas - y) / vy.
      - Si vy < 0 (se dirige vers le haut), timeToWall = (0 - y) / vy = -y/vy.
      - Si vy == 0 (se dirige parfaitement à l'horizontale), on met Infinity (pas de rebond).
    - Calcul du temps pour que la balle atteigne la raquette droite (t=d/v, timeToPaddle=(raquette - position de la balle) / vitesse de la balle).
    - Si que la balle atteint la raquette avant le mur, on sait que l'impact se fera ici. On peut donc break la boucle.
    - Sinon la balle touche d'abord le mur (en inversant la vy pour qu'elle simule le rebond), donc on avance la balle jusqu'au moment ou elle atteint la raquette.
    - Initialise le centre de la balle.
    - On force le centre de la raquette à rester entre 50 (paddleHeight / 2) et 450 (canvasHeight - paddleHeight / 2), pour que la raquette ne déborde pas.
    - Retourne le top y, donc place le centre de la raquette.
*/
export function predictBallY(ball: { x: number; y: number; vx: number; vy: number }, canvasHeight: number) {
  let x = ball.x
  let y = ball.y
  let vx = ball.vx
  let vy = ball.vy
  while (vx > 0 && x < rightPaddle.x) {
    let timeToWall = vy > 0 ? (canvasHeight - ballSize - y) / vy : vy < 0 ? -y / vy : Infinity
    let timeToPaddle = (rightPaddle.x - x) / vx
    if (timeToPaddle < timeToWall) {
      y += vy * timeToPaddle
      x += vx * timeToPaddle
      break
    }
    else {
      x += vx * timeToWall
      y += vy * timeToWall
      vy = -vy
    }
  }
  const centerY = y
  const cCenterY = Math.max(paddleHeight / 2, Math.min(canvasHeight - paddleHeight / 2, centerY))

  return cCenterY - paddleHeight / 2
}

/*
  Cette fonction est appelée chaque frame quand mode = 'ai'. Elle calcul une fois par seconde la prochaine cible de l'IA:
    - Lit le temps actuel en milliseconde.
    - Si au moins 1 secondes s'est écoulé depuis la dernière mise à jour de la cible:
      - Calcul le nombre de seconde réelle écoulée (proche de 1).
      - On force Prev à rester entre 0 et 1. Sert à calculer t.
      - Consitue la cible (au moment du rafraîchissement).
      - Initialise currentInterTargetY = dernière position + (prochaine position - dernière) * 1. (Ne s'applique pas pour le premier appel)
      - Copie la postion actuelle pour qu'elle devienne la dernière position.
      - Prédit la future position (top y) de la raquette grâce à la balle.
      - Prédit la future position (center y) de la raquette grâce à center y.
      - Ajoute un random de pixel entre -120 et +120 pour easy, et -60 et +60 pour medium, et 0 en hard.
      - Puis on initialise le centre de la prochaine cible en ajoutant le random.
      - On force nextTargetY à rester entre 0 et canvasHeight - paddleHeight pour que le bord sup ne sort pas de la raquette.
      - Enregistre le timestamp du dernier calcul pour repartir sur 1 seconde.
    - Calcul le temps écoulé depuis la dernière mise à jour.
    - Force la valeur à rester entre 0 et 1 pour éviter d’outrepasser la plage d’interpolation.
    - Calcul la cible actuelle entre previous et next en fonction de t.
    Lorsque t=0, la mise à jour n'est pas encore faite (currentTarget=previousTarget), si t=1, mise à jour est faite (donc currentTarget=nextTarget).
    - Convertit le centre actuel en top y pour savoir où positionner la raquette.
    - Calcul en pixels la distance entre le top y actuel et celui désiré.
    - Initialise la constante de déplacement max pour l'IA.
    - Si la distance est inférieure ou égale à MaxMove, on déplace exactement la raquette sur la cible.
    - Sinon on avance la raquette d'un petit pas vers -maxmove ou +maxmove.
    - On force une nouvelle fois la position de la raquette pour éviter toute erreur.
*/
export function aiStep(canvas:HTMLCanvasElement) {
  const now = Date.now()
  if (now - lastAiUpdate >= 1000) {
    const sec = (now - lastAiUpdate) / 1000
    const Prev = Math.min(Math.max(sec, 0), 1)
    const currentInterTargetY = previousTargetY + (nextTargetY - previousTargetY) * Prev
    previousTargetY = currentInterTargetY
    
    const predictTopY = predictBallY(ball, canvas!.height)
    const predictCenterY = predictTopY + paddleHeight / 2
    
    let offset = 0
    if (aiDifficulty === "easy")
      offset = (Math.random() - 0.5) * 240
    else if (aiDifficulty === "medium")
      offset = (Math.random() - 0.5) * 120

    const rawNextCenter = predictCenterY + offset
    nextTargetY = Math.max(0, Math.min(canvas!.height - paddleHeight, rawNextCenter))
    lastAiUpdate = now
  }

  const elapsed = (now - lastAiUpdate) / 1000
  const t = Math.min(Math.max(elapsed, 0), 1)
  const currentTargetY = previousTargetY + (nextTargetY - previousTargetY) * t
  const desiredTopY = currentTargetY - paddleHeight / 2

  const delta = desiredTopY - rightPaddle.y
  const maxMove = baseSpeed
  if (Math.abs(delta) <= maxMove) {
    rightPaddle.y = desiredTopY
  }
  else {
    rightPaddle.y += Math.sign(delta) * maxMove
  }
  rightPaddle.y = Math.max(0, Math.min(canvas!.height - paddleHeight, rightPaddle.y))
}