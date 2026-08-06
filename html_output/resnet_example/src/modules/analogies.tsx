import React, { useEffect, useRef } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import {
  SC,
  clearScene,
  drawClimber,
  drawHold,
  drawRope,
  drawSummitFlag,
  drawSceneLabel,
  drawLegend,
  drawArrow,
  lerp,
} from './climbKit';

// ============================================================================
// 类比自动动画合集（登山攀岩主题）—— 每个动画满足：
//   one subject + one verb + one goal；244x130；自动循环；离屏暂停；
//   无控制、无重播文字。Hero 两栏使用稍大画布。
// ============================================================================

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/** 类比动画通用宿主：负责 HiDPI、rAF 循环、IntersectionObserver 暂停、is-ready。 */
function AnalogyHost({
  draw,
  w = 244,
  h = 130,
  id,
}: {
  draw: DrawFn;
  w?: number;
  h?: number;
  id: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, w, h);
    } catch {
      return;
    }
    let raf = 0;
    let running = false;
    let start = performance.now();

    const frame = (now: number) => {
      const t = ((now - start) / 1000) % 3.6; // 2.4–3.6s 循环
      drawRef.current(ctx, w, h, t);
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
      raf = requestAnimationFrame(frame);
    };
    const startFn = () => {
      if (running) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stopFn = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const disconnect = observeCanvas(canvas, startFn, stopFn);
    startFn();
    return () => {
      stopFn();
      disconnect();
    };
  }, [w, h]);

  return <canvas id={`cv-${id}`} ref={ref} width={w} height={h} />;
}

// ---------- Hero：旧方法（plain 网络：从谷底起跳够目标，失败） ----------
const heroPlainDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h, { showGauge: true });
  const peakX = w * 0.72;
  const peakY = h * 0.28;
  drawSummitFlag(ctx, peakX, peakY, t, '目标');
  const cyc = t / 3.6;
  // 谷底起跳：抛物线，够不到
  const jumpT = (cyc * 1.5) % 1;
  const x = w * 0.3 + jumpT * w * 0.28;
  const y = h * 0.86 - Math.sin(jumpT * Math.PI) * h * 0.26;
  drawClimber(ctx, x, y, { lean: 0.6, tired: 0.9 });
  drawHold(ctx, peakX - 8, peakY + 34, 4, SC.hold);
  // 虚线表示目标高度线
  ctx.strokeStyle = SC.steep;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(w * 0.1, peakY + 26);
  ctx.lineTo(w * 0.9, peakY + 26);
  ctx.stroke();
  ctx.setLineDash([]);
  drawSceneLabel(ctx, '从谷底起跳，始终够不到', w * 0.5, h - 8, SC.steep);
};

// ---------- Hero：新方法（残差网络：站在当前岩点逐级上移，成功） ----------
const heroResnetDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h, { showGauge: true });
  const peakX = w * 0.72;
  const peakY = h * 0.28;
  drawSummitFlag(ctx, peakX, peakY, t, '目标');
  const cyc = t / 3.6;
  const steps = 5;
  const seg = Math.floor(cyc * steps);
  const frac = (cyc * steps) % 1;
  const prog = (seg + frac) / steps;
  const y = h * 0.86 - prog * (h * 0.56);
  const x = w * 0.28 + prog * w * 0.34;
  // 岩点阶梯
  for (let i = 0; i < steps; i++) {
    const yy = h * 0.86 - ((i + 1) / steps) * h * 0.56;
    const xx = w * 0.26 + ((i + 1) / steps) * w * 0.34;
    drawHold(ctx, xx, yy, 4, SC.hold);
  }
  // 绳索（捷径）
  drawRope(ctx, w * 0.2, h * 0.86, peakX, peakY + 24, SC.rope, false, 8);
  drawClimber(ctx, x, y, { lean: 0.2 });
  drawSceneLabel(ctx, '沿岩点小幅上移，接近目标', w * 0.5, h - 8, SC.rope);
};

// ---------- §1 类比：越陡的山越难爬 ----------
const anaSteepDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  drawSummitFlag(ctx, w * 0.78, h * 0.2, t, '山顶');
  const cyc = t / 3.6;
  // 坡度随时间变陡
  const steepness = lerp(0.15, 0.6, cyc);
  const x = w * 0.24;
  const y = h * 0.82 - steepness * h * 0.5 - Math.sin(cyc * Math.PI * 2) * 3;
  drawClimber(ctx, x, y, { lean: 0.7, tired: steepness * 1.2 });
  // 山坡示意线（越来越陡）
  ctx.strokeStyle = SC.mountainDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.9);
  ctx.lineTo(w * 0.3, h * 0.9 - steepness * h * 0.55);
  ctx.lineTo(w * 0.7, h * 0.9 - steepness * h * 0.55 - 14);
  ctx.stroke();
  drawSceneLabel(ctx, '坡越来越陡，步伐越来越沉', w * 0.5, h - 8, SC.steep);
};

// ---------- §2 类比：站得越高看得越全 ----------
const anaViewDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  const cyc = t / 3.6;
  const spot = Math.floor(cyc * 3) % 3; // 3 个观景台
  const ys = [h * 0.78, h * 0.58, h * 0.38];
  const xs = [w * 0.24, w * 0.42, w * 0.6];
  // 三个观景台
  for (let i = 0; i < 3; i++) {
    drawHold(ctx, xs[i], ys[i], 4, i === spot ? SC.climber : SC.hold);
  }
  // 登山者在当前观景台
  const bob = Math.sin(cyc * Math.PI * 2) * 1.5;
  drawClimber(ctx, xs[spot], ys[spot] + 8 + bob, { lean: 0 });
  // 望远镜视野框（目标细节）
  const fw = 46;
  const fh = 30;
  const fx = w * 0.78;
  const fy = ys[spot] - 16;
  ctx.strokeStyle = SC.climber;
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, fy, fw, fh);
  drawSceneLabel(ctx, spot === 0 ? '近处细节' : spot === 1 ? '局部形状' : '全局轮廓', fx + fw / 2, fy - 5, SC.climber);
  // 视野内内容：随 spot 变抽象
  ctx.fillStyle = spot === 0 ? SC.mountainDark : spot === 1 ? SC.mountain : SC.inkMuted;
  if (spot === 0) {
    ctx.fillRect(fx + 6, fy + 8, 4, 12);
    ctx.fillRect(fx + 14, fy + 6, 4, 14);
    ctx.fillRect(fx + 22, fy + 10, 4, 10);
  } else if (spot === 1) {
    ctx.beginPath();
    ctx.arc(fx + 16, fy + 14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx + 34, fy + 12, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(fx + 4, fy + 26);
    ctx.lineTo(fx + 16, fy + 8);
    ctx.lineTo(fx + 28, fy + 22);
    ctx.lineTo(fx + 42, fy + 4);
    ctx.lineTo(fx + 46, fy + 26);
    ctx.closePath();
    ctx.fill();
  }
  drawSceneLabel(ctx, '站得越高，看得越全', w * 0.42, h - 8, SC.climber);
};

// ---------- §3 类比：站在岩点上够下一个 ----------
const anaJumpDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  drawSummitFlag(ctx, w * 0.8, h * 0.22, t);
  const cyc = t / 3.6;
  const half = cyc < 0.5 ? 0 : 1; // 左右两栏：谷底跳 vs 岩点上够
  const cx = half === 0 ? w * 0.28 : w * 0.66;
  // 目标岩点
  const targetY = h * 0.32;
  drawHold(ctx, cx, targetY, 5, SC.flag);
  if (half === 0) {
    // 谷底起跳
    const jt = (cyc * 2) % 1;
    const yy = h * 0.84 - Math.sin(jt * Math.PI) * h * 0.34;
    drawClimber(ctx, cx, yy, { lean: 0.8, tired: 0.7 });
    ctx.strokeStyle = SC.steep;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - 14, targetY);
    ctx.lineTo(cx + 14, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    drawSceneLabel(ctx, '谷底起跳', cx, h - 8, SC.steep);
  } else {
    // 站在当前岩点，够下一个
    drawHold(ctx, cx, h * 0.62, 4, SC.hold);
    const yy = h * 0.58 + Math.sin(cyc * Math.PI * 2) * 3;
    drawClimber(ctx, cx, yy, { lean: 0.15 });
    drawRope(ctx, cx, h * 0.66, cx, targetY + 6, SC.rope, false, 6);
    drawSceneLabel(ctx, '岩点上微调', cx, h - 8, SC.rope);
  }
  ctx.strokeStyle = SC.line;
  ctx.beginPath();
  ctx.moveTo(w / 2, 8);
  ctx.lineTo(w / 2, h - 12);
  ctx.stroke();
};

// ---------- §4 类比：当前点 + 一小步 = 到达 ----------
const anaReachDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  const cyc = t / 3.6;
  const x = w * 0.42;
  // 输入岩点（x）
  drawHold(ctx, x, h * 0.72, 5, SC.hold);
  drawSceneLabel(ctx, 'x（当前点）', x, h * 0.85, SC.ink);
  // 残差 F：橙色箭头向上
  const f = lerp(10, 34, Math.abs(Math.sin(cyc * Math.PI)));
  drawArrow(ctx, x, h * 0.68, x, h * 0.68 - f, SC.flag, 6);
  drawSceneLabel(ctx, 'F(x)', x + 12, h * 0.68 - f / 2, SC.flag);
  // 输出 y：绿色圆点
  const yPos = h * 0.68 - f;
  drawHold(ctx, x, yPos, 6, SC.rope);
  drawSceneLabel(ctx, 'y = x + F', x, yPos - 10, SC.rope);
  // 登山者
  drawClimber(ctx, x + 26, yPos + 14, { lean: -0.2 });
  drawSceneLabel(ctx, '站在当前点，补上差的那一点', w * 0.5, h - 8, SC.inkMuted);
};

// ---------- §5 类比：间距不同装备不同 ----------
const anaGearDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  const cyc = t / 3.6;
  const mode = Math.floor(cyc * 3) % 3; // A 徒手 / B 绳索 / C 全套
  const cols = [w * 0.2, w * 0.5, w * 0.8];
  const gaps = [0.2, 0.45, 0.7]; // 间距
  const cx = cols[mode];
  const baseY = h * 0.78;
  const topY = h * 0.3;
  // 两段岩点：间距随模式变大
  drawHold(ctx, cx - 18, baseY, 4);
  drawHold(ctx, cx - 18, topY, 4, SC.flag);
  // 不同装备的跨越方式
  if (mode === 0) {
    drawRope(ctx, cx - 18, baseY, cx - 18, topY + 8, SC.rope, false, 0); // 徒手=直接小步（恒等）
    drawClimber(ctx, cx + 16, lerp(baseY, topY, Math.abs(Math.sin(cyc * Math.PI))), { lean: 0.1 });
    drawSceneLabel(ctx, 'A 徒手跨（恒等）', cx, h - 8, SC.rope);
  } else if (mode === 1) {
    drawRope(ctx, cx - 18, baseY, cx + 14, topY + 10, SC.rope, false, 10);
    drawClimber(ctx, cx + 10, lerp(baseY, topY, Math.abs(Math.sin(cyc * Math.PI))), { lean: 0.3 });
    drawSceneLabel(ctx, 'B 挂绳索（投影一处）', cx, h - 8, SC.climber);
  } else {
    drawRope(ctx, cx - 18, baseY, cx + 16, topY + 12, SC.flag, true, 14);
    drawClimber(ctx, cx + 12, lerp(baseY, topY, Math.abs(Math.sin(cyc * Math.PI))), { lean: 0.4 });
    drawSceneLabel(ctx, 'C 锁扣+绳（全部投影）', cx, h - 8, SC.flag);
  }
};

// ---------- §6 类比：一条路五段路标 ----------
const anaTrailDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  drawSummitFlag(ctx, w * 0.82, h * 0.2, t, '峰顶');
  const cyc = t / 3.6;
  const segs = 5;
  const seg = Math.floor(cyc * segs);
  const frac = (cyc * segs) % 1;
  // 五段路线（长度递减代表特征图缩小）
  const segLens = [34, 28, 22, 16, 10];
  let x = w * 0.12;
  let y = h * 0.86;
  const path: { x: number; y: number }[] = [{ x, y }];
  for (let i = 0; i < segs; i++) {
    x += segLens[i] * 0.9;
    y -= segLens[i] * 0.55;
    path.push({ x, y });
    drawHold(ctx, x, y, 3.5, i <= seg ? SC.climber : SC.hold);
  }
  // 已走过的路
  ctx.strokeStyle = SC.rope;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= Math.min(seg, segs - 1); i++) {
    const px = lerp(path[i].x, path[i + 1].x, i === seg ? frac : 1);
    const py = lerp(path[i].y, path[i + 1].y, i === seg ? frac : 1);
    if (i === 0) ctx.moveTo(path[0].x, path[0].y);
    else ctx.lineTo(i === seg ? px : path[i].x, i === seg ? py : path[i].y);
  }
  ctx.stroke();
  // 登山者
  const cx = lerp(path[seg].x, path[seg + 1].x, frac);
  const cy = lerp(path[seg].y, path[seg + 1].y, frac);
  drawClimber(ctx, cx, cy + 4, { lean: 0.2 });
  drawSceneLabel(ctx, '五段路标：尺寸减半，通道翻倍', w * 0.45, h - 8, SC.climber);
};

// ---------- §7 类比：步子太大容易摔 ----------
const anaStrideDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  drawSummitFlag(ctx, w * 0.8, h * 0.2, t);
  const cyc = t / 3.6;
  const mode = Math.floor(cyc * 3) % 3; // 小碎步 / 适中 / 太大
  const x = w * 0.2 + ((cyc * 3) % 1) * w * 0.5;
  if (mode === 0) {
    // 小碎步：几乎不动
    const y = h * 0.7 + Math.sin(cyc * Math.PI * 8) * 1;
    drawClimber(ctx, w * 0.3, y, { lean: 0 });
    drawSceneLabel(ctx, '小碎步：走了很久还在原地', w * 0.45, h - 8, SC.inkMuted);
  } else if (mode === 1) {
    // 适中：稳步
    const y = h * 0.72 - x * 0.55;
    drawClimber(ctx, x, y, { lean: 0.15 });
    drawSceneLabel(ctx, '适中步幅：稳步爬升', w * 0.45, h - 8, SC.rope);
  } else {
    // 太大：踉跄摔倒
    const wobble = Math.sin(cyc * Math.PI * 6);
    const y = h * 0.74 - Math.abs(wobble) * 8;
    drawClimber(ctx, x, y, { lean: 0.9, tired: 0.8 });
    drawSceneLabel(ctx, '步子太大：一步跨空', w * 0.45, h - 8, SC.steep);
  }
};

// ---------- §8 类比：路线图四个营地 ----------
const anaMapDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  const cyc = t / 3.6;
  drawSummitFlag(ctx, w * 0.82, h * 0.2, t, '峰顶');
  // 四个营地（stage）
  const camps = [
    { x: w * 0.16, y: h * 0.78, label: 'conv2_x' },
    { x: w * 0.38, y: h * 0.6, label: 'conv3_x' },
    { x: w * 0.6, y: h * 0.44, label: 'conv4_x' },
    { x: w * 0.78, y: h * 0.3, label: 'conv5_x' },
  ];
  // 营地间绳索
  for (let i = 0; i < camps.length - 1; i++) {
    drawRope(ctx, camps[i].x, camps[i].y - 8, camps[i + 1].x, camps[i + 1].y - 8, SC.rope, false, 6);
  }
  // 小帐篷（营地）
  camps.forEach((c, i) => {
    const active = Math.floor(cyc * 4) % 4 === i;
    const color = active ? SC.flag : SC.mountainDark;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(c.x - 9, c.y);
    ctx.lineTo(c.x, c.y - 12);
    ctx.lineTo(c.x + 9, c.y);
    ctx.closePath();
    ctx.fill();
    drawSceneLabel(ctx, c.label, c.x, c.y + 12, active ? SC.flag : SC.inkMuted);
  });
  drawSceneLabel(ctx, '四座营地，绳索相连', w * 0.4, h - 8, SC.inkMuted);
};

// ---------- §9 类比：窄缝面前先收背包 ----------
const anaPackDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  const cyc = t / 3.6;
  // 窄岩缝（中间）
  const gapX = w * 0.5;
  ctx.fillStyle = SC.mountainDark;
  ctx.fillRect(gapX - 3, h * 0.18, 6, h * 0.66);
  ctx.fillStyle = SC.mountain;
  ctx.beginPath();
  ctx.moveTo(gapX - 16, h * 0.22);
  ctx.lineTo(gapX - 3, h * 0.3);
  ctx.lineTo(gapX - 3, h * 0.84);
  ctx.lineTo(gapX - 16, h * 0.84);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(gapX + 16, h * 0.22);
  ctx.lineTo(gapX + 3, h * 0.3);
  ctx.lineTo(gapX + 3, h * 0.84);
  ctx.lineTo(gapX + 16, h * 0.84);
  ctx.closePath();
  ctx.fill();
  // 登山者过缝：背包先压缩（1×1 降维）再恢复
  const phase = (cyc * 2) % 1;
  const x = lerp(w * 0.18, w * 0.82, phase);
  const compress = Math.max(0, 1 - Math.abs(x - gapX) / 22); // 接近缝时压缩
  const packW = lerp(12, 6, compress);
  const packH = lerp(8, 14, compress);
  drawClimber(ctx, x, h * 0.66, { lean: 0.2 });
  // 背包
  ctx.fillStyle = SC.flag;
  ctx.fillRect(x + 8, h * 0.66 - packH, packW, packH);
  drawSceneLabel(ctx, '1×1 压缩 → 3×3 过缝 → 1×1 恢复', w * 0.45, h - 8, SC.flag);
};

// ---------- §10 类比：谁先登顶 ----------
const anaRaceDraw: DrawFn = (ctx, w, h, t) => {
  clearScene(ctx, w, h);
  drawSummitFlag(ctx, w * 0.88, h * 0.16, t, '峰顶');
  const cyc = t / 3.6;
  const runners = [
    { y: h * 0.36, color: SC.steep, label: 'VGG-16', speed: 0.45 },
    { y: h * 0.58, color: SC.climber, label: 'ResNet-34', speed: 0.7 },
    { y: h * 0.8, color: SC.flag, label: 'ResNet-152', speed: 1 },
  ];
  runners.forEach((r) => {
    const prog = Math.min(1, ((cyc * 1.6) % 1.6) * r.speed);
    const x = w * 0.1 + prog * w * 0.72;
    drawClimber(ctx, x, r.y, { lean: 0.3, color: r.color });
    drawSceneLabel(ctx, r.label, w * 0.08, r.y + 4, r.color);
  });
  drawLegend(ctx, [
    { color: SC.steep, label: '慢' },
    { color: SC.flag, label: '快' },
  ], w * 0.12, h - 6);
};

// ============================================================================
// 导出组件（注册用）
// ============================================================================

export const HeroPlain: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={heroPlainDraw} w={320} h={160} id="hero-plain" />
);
export const HeroResnet: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={heroResnetDraw} w={320} h={160} id="hero-resnet" />
);
export const AnaSteep: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaSteepDraw} id="ana-steep" />
);
export const AnaView: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaViewDraw} id="ana-view" />
);
export const AnaJump: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaJumpDraw} id="ana-jump" />
);
export const AnaReach: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaReachDraw} id="ana-reach" />
);
export const AnaGear: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaGearDraw} id="ana-gear" />
);
export const AnaTrail: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaTrailDraw} id="ana-trail" />
);
export const AnaStride: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaStrideDraw} id="ana-stride" />
);
export const AnaMap: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaMapDraw} id="ana-map" />
);
export const AnaPack: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaPackDraw} id="ana-pack" />
);
export const AnaRace: React.FC<WidgetProps> = () => (
  <AnalogyHost draw={anaRaceDraw} id="ana-race" />
);
