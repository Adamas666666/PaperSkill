// climbKit.ts — 登山攀岩主题共享 Canvas 绘制工具包（ResNet 教程专用）。
// 提供统一的山野场景、攀登者、岩点、绳索、旗帜、标签等绘制原语，
// 使 Hero、全部类比动画与交互模块保持一致的视觉词汇与语义色。
// 语义色：红=失败/退化，蓝=当前/模型，绿=修复/捷径，橙=目标/强调。

import { lerp, clamp } from '../lib/canvasKit';

// ---- 语义色（与 paper.css :root 保持一致，供 Canvas 直接使用）----
export const SC = {
  sceneBg: '#f5f8f0',
  mountain: '#b8c9a7',
  mountainDark: '#76906a',
  hold: '#92400e',
  climber: '#27446e',
  rope: '#228d5c',
  steep: '#c43f52',
  flag: '#d97706',
  ink: '#21324a',
  inkMuted: '#68778f',
  line: '#d7deea',
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 清空场景：quiet 底色 + 底部山体剪影 + 深色等高线 + 可选海拔标尺。 */
export function clearScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { showGauge?: boolean; ridge?: number } = {}
) {
  const ridge = opts.ridge ?? h * 0.86;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = SC.sceneBg;
  ctx.fillRect(0, 0, w, h);

  // 远山（两层剪影）
  ctx.fillStyle = SC.mountain;
  ctx.beginPath();
  ctx.moveTo(0, ridge);
  ctx.lineTo(w * 0.22, h * 0.52);
  ctx.lineTo(w * 0.42, ridge - 6);
  ctx.lineTo(w * 0.62, h * 0.44);
  ctx.lineTo(w * 0.82, ridge - 2);
  ctx.lineTo(w, h * 0.56);
  ctx.lineTo(w, ridge + 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = SC.mountainDark;
  ctx.beginPath();
  ctx.moveTo(0, ridge + 10);
  ctx.lineTo(w * 0.3, h * 0.78);
  ctx.lineTo(w * 0.55, ridge + 4);
  ctx.lineTo(w * 0.8, h * 0.8);
  ctx.lineTo(w, h * 0.72);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  if (opts.showGauge) drawGauge(ctx, w, h);
}

/** 右侧海拔标尺（100/200/300m），用 muted 色绘制。 */
export function drawGauge(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = SC.line;
  ctx.lineWidth = 1;
  const gx = w - 16;
  ctx.beginPath();
  ctx.moveTo(gx, h - 26);
  ctx.lineTo(gx, 22);
  ctx.stroke();
  ctx.fillStyle = SC.inkMuted;
  ctx.font = '9px "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 3; i++) {
    const y = h - 26 - ((h - 48) / 3) * i;
    ctx.fillText((300 - i * 100) + 'm', gx - 3, y + 3);
  }
  ctx.textAlign = 'left';
}

/** 山峰 + 旗帜（目标）。fx/fy 为旗帜底座坐标。 */
export function drawSummitFlag(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  time: number = 0,
  label?: string
) {
  // 峰顶小块
  ctx.fillStyle = SC.mountain;
  ctx.beginPath();
  ctx.moveTo(fx - 22, fy + 26);
  ctx.lineTo(fx, fy - 2);
  ctx.lineTo(fx + 22, fy + 26);
  ctx.closePath();
  ctx.fill();

  // 旗杆 + 飘旗
  ctx.strokeStyle = SC.hold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fx, fy - 2);
  ctx.lineTo(fx, fy - 26);
  ctx.stroke();

  const wave = Math.sin(time * 3) * 2;
  ctx.fillStyle = SC.flag;
  ctx.beginPath();
  ctx.moveTo(fx, fy - 26);
  ctx.quadraticCurveTo(fx + 12, fy - 24 + wave, fx + 22, fy - 20 + wave);
  ctx.lineTo(fx + 22, fy - 13 + wave);
  ctx.quadraticCurveTo(fx + 12, fy - 17 + wave, fx, fy - 19);
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.fillStyle = SC.ink;
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, fx, fy + 38);
    ctx.textAlign = 'left';
  }
}

/** 岩点（把手/立足点）。圆形 + 深色描边。 */
export function drawHold(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number = 4,
  color: string = SC.hold
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** 攀登者（简单图元构成的小人）。x,y 为中心基点，lean∈[-1,1] 前倾量，tired∈[0,1] 疲惫量。 */
export function drawClimber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: { lean?: number; tired?: number; color?: string; scale?: number } = {}
) {
  const lean = opts.lean ?? 0;
  const tired = opts.tired ?? 0;
  const color = opts.color ?? SC.climber;
  const s = opts.scale ?? 1;
  const headR = 3.6 * s;
  const bodyH = 10 * s;
  const armReach = 8 * s * (1 - tired * 0.5);

  ctx.save();
  ctx.translate(x, y);
  // 身体（前倾）
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(lean * 4 * s, -bodyH);
  ctx.stroke();
  // 头
  const headX = lean * 4 * s;
  ctx.beginPath();
  ctx.arc(headX, -bodyH - headR - 1.5 * s, headR, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  // 伸手（够岩点）
  ctx.beginPath();
  ctx.moveTo(lean * 4 * s, -bodyH * 0.8);
  ctx.lineTo(lean * 4 * s + armReach, -bodyH - 5 * s);
  ctx.stroke();
  // 腿
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(2 * s, 6 * s);
  ctx.moveTo(0, 0);
  ctx.lineTo(-2 * s, 6 * s);
  ctx.stroke();
  ctx.restore();
}

/** 绳索/捷径：从 A 到 B 的曲线，颜色按语义（绿=恒等捷径，橙=投影）。 */
export function drawRope(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = SC.rope,
  dash: boolean = false,
  bend: number = 0
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (dash) ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const mx = (x1 + x2) / 2;
  ctx.quadraticCurveTo(mx, (y1 + y2) / 2 + bend, x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** 平滑损失/误差曲线：输入数据点数组，绘制在给定区域内（自动归一化）。 */
export function drawCurve(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  points: number[],
  color: string,
  opts: { fill?: boolean; lineWidth?: number } = {}
) {
  const maxV = Math.max(...points, 1);
  const stepX = rect.w / (points.length - 1 || 1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = opts.lineWidth ?? 2;
  ctx.beginPath();
  points.forEach((v, i) => {
    const px = rect.x + i * stepX;
    const py = rect.y + rect.h - (v / maxV) * rect.h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  if (opts.fill) {
    const lastX = rect.x + (points.length - 1) * stepX;
    ctx.lineTo(lastX, rect.y + rect.h);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.closePath();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** 稳定的白色技术 inset（#d7deea 边框），用于曲线/特征/数值区域。 */
export function drawInset(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  opts: { label?: string } = {}
) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = SC.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 6);
  ctx.fill();
  ctx.stroke();
  if (opts.label) {
    ctx.fillStyle = SC.inkMuted;
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillText(opts.label, rect.x + 8, rect.y + 16);
  }
}

/** 场景标签（主文字色）。 */
export function drawSceneLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = SC.ink
) {
  ctx.fillStyle = color;
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

/** 小图例：圆点 + 文字。 */
export function drawLegend(
  ctx: CanvasRenderingContext2D,
  items: { color: string; label: string }[],
  x: number,
  y: number
) {
  ctx.textAlign = 'left';
  let cx = x;
  for (const it of items) {
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.arc(cx + 4, y - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SC.inkMuted;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(it.label, cx + 11, y);
    cx += 11 + ctx.measureText(it.label).width + 14;
  }
}

/** 简易箭头（用于数轴等）。 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  headSize: number = 5
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI / 6), y2 - headSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI / 6), y2 - headSize * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

/** 进度条（结果竞赛用）。 */
export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  progress: number,
  color: string,
  label: string
) {
  ctx.fillStyle = '#eef1f7';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, rect.h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, clamp(progress, 0, 1) * rect.w, rect.h, rect.h / 2);
  ctx.fill();
  // 标签
  ctx.fillStyle = SC.ink;
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillText(label, rect.x + 8, rect.y + rect.h / 2 + 4);
  ctx.fillStyle = SC.inkMuted;
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(progress * 100) + '%', rect.x + rect.w - 6, rect.y + rect.h / 2 + 4);
  ctx.textAlign = 'left';
}

/** 用 lerp 在两个数之间插值（重新导出便于 widget 使用）。 */
export { lerp, clamp };
