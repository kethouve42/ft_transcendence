const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const MARGIN = 70


export type Obstacle = {
    x: number
    y: number
    width: number
    height: number
}

export type MapConfig = {
    name: string
    background: string
    obstacle?: Obstacle[]
    randomObstacle?: number
}

export const maps: MapConfig[] = [
    { name: "Classic", background: "#222" },
    { name: "Blue Sky", background: "#3498db" },
    { name: "Green Field", background: "#27ae60" },
    { name: "Random Block", background: "#000000", randomObstacle: 1},
    { name: "Double Random Block", background: "#000000", randomObstacle: 2}
]

export function generateRandomObstacles(count: number): Obstacle[] {
    const obstacles: Obstacle[] = []
    for (let i = 0; i < count; i++) {
        const width = 60 // Largeur du block
        const height = 60 // Longueur du block
        // Les blocs sont disposes loin des bords
        const x = Math.random() * (CANVAS_WIDTH - width - 2*MARGIN) + MARGIN
        const y = Math.random() * (CANVAS_HEIGHT - height - 2*MARGIN) + MARGIN
        obstacles.push({ x, y, width, height})
    }
    return obstacles
}

export function drawObstacles(ctx: CanvasRenderingContext2D, obstacle: Obstacle[]) {
    ctx.save()
    ctx.fillStyle = "#ff0000"
    obstacle.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
    })
    ctx.restore()
}