export const COLORS = {
  bg: '#f5f8f0',
  light: '#b8c9a7',
  dark: '#76906a',
  wood: '#92400e',
  blue: '#27446e',
  green: '#228d5c',
  red: '#c43f52',
  orange: '#d97706',
  purple: '#7c3aed',
  ink: '#21324a',
  muted: '#68778f',
  line: '#d7deea',
};

export function clearMusicScene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function drawStaff(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, gap = 9) {
  ctx.strokeStyle = COLORS.light;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y + i * gap);
    ctx.lineTo(x + w, y + i * gap);
    ctx.stroke();
  }
}

export function drawKeyboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const keys = 12;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = COLORS.dark;
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  for (let i = 1; i < keys; i += 1) {
    const px = x + (i * w) / keys;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px, y + h);
    ctx.stroke();
  }
}

export function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label?: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 8, 6, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 7, y - 25);
  ctx.stroke();
  if (label) drawSceneLabel(ctx, label, x + 12, y - 14, color);
}

export function drawHand(ctx: CanvasRenderingContext2D, x: number, y: number, color = COLORS.blue) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 18);
  ctx.quadraticCurveTo(x, y - 24, x + 8, y - 8);
  ctx.lineTo(x + 12, y + 8);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 12, y + 9, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMetronome(ctx: CanvasRenderingContext2D, x: number, y: number, phase = 0) {
  ctx.fillStyle = '#eef2e8';
  ctx.strokeStyle = COLORS.wood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 17, y + 25);
  ctx.lineTo(x + 17, y + 25);
  ctx.lineTo(x + 11, y - 25);
  ctx.lineTo(x - 11, y - 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const a = Math.sin(phase) * 0.38;
  ctx.beginPath();
  ctx.moveTo(x, y + 12);
  ctx.lineTo(x + Math.sin(a) * 34, y - 19 - Math.cos(a) * 10);
  ctx.strokeStyle = COLORS.orange;
  ctx.stroke();
}

export function drawTargetRing(ctx: CanvasRenderingContext2D, x: number, y: number, r = 11) {
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawSceneLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = COLORS.ink) {
  ctx.fillStyle = color;
  ctx.font = '600 13px "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.fillText(text, x, y);
}

export function drawLegend(ctx: CanvasRenderingContext2D, items: Array<[string, string]>, x: number, y: number) {
  items.forEach(([text, color], index) => {
    const yy = y + index * 18;
    ctx.fillStyle = color;
    ctx.fillRect(x, yy - 8, 10, 4);
    drawSceneLabel(ctx, text, x + 16, yy, COLORS.muted);
  });
}
