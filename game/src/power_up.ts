
const SPEEDUP = 1.25
const SPEEDDOWN = 0.75

export type powerUpsType = "speedUp" | "speedDown"

export interface powerUp {
    x: number
    y: number
    type: powerUpsType
}

export interface AttiveEffect {
    type: powerUpsType
    end: number
    oriVx: number
    oriVy: number
}

export const powerUpSize = 20
export let powerUps : powerUp[] = []
let lastSpawn = Date.now()
let nextSpawn = 5000 + Math.random() * 5000

export let activeEffect: AttiveEffect | null = null

// X/Y random mais toujours en veillant à rester à l’intérieur du canvas
export function spawnPowerUp(canvasHeight: number, canvasWidth: number) {
    const x = powerUpSize + Math.random() * (canvasWidth - 2 * powerUpSize)
    const y = powerUpSize + Math.random() * (canvasHeight - 2 * powerUpSize)
    const type = Math.random() < 0.5 ? "speedUp" : "speedDown"
    powerUps.push({ x, y, type })
}

export function updatePowerUps(now: number, canvasHeight: number, canvasWidth: number, ball: {x: number, y: number, vx: number, vy: number}) {
    if (now - lastSpawn > nextSpawn) {
        spawnPowerUp(canvasHeight, canvasWidth)
        lastSpawn = now
        nextSpawn = 5000 + Math.random() * 5000
    }

    powerUps = powerUps.filter((pu) => {
        const hit = ball.x + powerUpSize > pu.x &&
                    ball.x < pu.x + powerUpSize &&
                    ball.y + powerUpSize > pu.y &&
                    ball.y < pu.y + powerUpSize
        if (hit) {
            activeEffect = {
                type: pu.type,
                end: now + 5000,
                oriVx: Math.abs(ball.vx),
                oriVy: Math.abs(ball.vy),
            }
            const factor = pu.type === "speedUp" ? SPEEDUP : SPEEDDOWN
            ball.vx *= factor
            ball.vy *= factor
            return (false)
        }
        return (true)
    })

    if (activeEffect && now >= activeEffect.end) {
        const signX = Math.sign(ball.vx) | 1
        const signY = Math.sign(ball.vy) | 1
        ball.vx = signX * activeEffect.oriVx
        ball.vy = signY * activeEffect.oriVy
        activeEffect = null
    }
}

export function drawPowerUp(ctx: CanvasRenderingContext2D) {
    powerUps.forEach((pu) => {
        ctx.fillStyle = pu.type === "speedUp" ? "lime" : "orange"
        ctx.fillRect(pu.x, pu.y, powerUpSize, powerUpSize)
    })
}