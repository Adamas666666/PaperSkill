import React, { useEffect, useMemo, useRef, useState } from 'react';
import { clamp, easeInOutQuad, setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import {
  COLORS,
  clearMusicScene,
  drawHand,
  drawKeyboard,
  drawLegend,
  drawMetronome,
  drawNote,
  drawSceneLabel,
  drawStaff,
  drawTargetRing,
} from './musicKit';

type DrawFn = (ctx: CanvasRenderingContext2D, time: number) => void;

function useAnimatedCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  draw: DrawFn,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, width, height);
    } catch {
      return;
    }
    let frame: number | null = null;
    let active = false;
    const tick = (time: number) => {
      draw(ctx, time);
      canvas.classList.add('is-ready');
      frame = active ? requestAnimationFrame(tick) : null;
    };
    const start = () => {
      active = true;
      if (frame === null) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      active = false;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => {
      stop();
      disconnect();
    };
  }, deps);
}

function Canvas({ canvasRef, w, h }: { canvasRef: React.RefObject<HTMLCanvasElement>; w: number; h: number }) {
  return <canvas ref={canvasRef} width={w} height={h} />;
}

export const HeroScene: React.FC<WidgetProps> = ({ moduleId }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const isNew = moduleId === 'new';
  useAnimatedCanvas(ref, 380, 170, (ctx, time) => {
    const p = (time % 3200) / 3200;
    clearMusicScene(ctx, 380, 170);
    drawStaff(ctx, 28, 45, 324, 13);
    const x = 44 + 280 * p;
    if (isNew) {
      ctx.strokeStyle = COLORS.blue;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(38, 114); ctx.lineTo(330, 114); ctx.stroke();
      drawNote(ctx, x, 82, COLORS.orange, 'F(x)');
      drawTargetRing(ctx, 330, 82);
      drawSceneLabel(ctx, 'x 保留', 38, 137, COLORS.blue);
    } else {
      drawNote(ctx, x, 70 + Math.sin(p * Math.PI * 8) * 14, p > 0.62 ? COLORS.red : COLORS.blue);
      drawTargetRing(ctx, 330, 82);
      drawSceneLabel(ctx, '整段重学', 38, 137, COLORS.red);
    }
  }, [isNew]);
  return <Canvas canvasRef={ref} w={380} h={170} />;
};

export const PianoAnalogy: React.FC<WidgetProps> = ({ chapterId }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const chapter = Number(chapterId.replace('chap-', '')) || 1;
  useAnimatedCanvas(ref, 244, 130, (ctx, time) => {
    const p = (time % 3000) / 3000;
    const q = easeInOutQuad(p < 0.5 ? p * 2 : (1 - p) * 2);
    clearMusicScene(ctx, 244, 130);
    drawStaff(ctx, 18, 26, 208, 9);
    drawKeyboard(ctx, 18, 91, 208, 25);
    const labels = ['加长', '调音', '修正', '相加', '对齐', '推进', '节拍', '瓶颈', '响应', '比较'];
    const color = chapter === 1 && q > 0.7 ? COLORS.red : chapter === 10 ? COLORS.green : COLORS.blue;
    if (chapter === 7) drawMetronome(ctx, 46, 57, p * Math.PI * 2);
    if (chapter === 9) {
      ctx.strokeStyle = COLORS.orange; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(42, 76); ctx.lineTo(42 + q * 140, 76 - Math.sin(q * Math.PI * 4) * 15); ctx.stroke();
      drawTargetRing(ctx, 190, 76);
    } else {
      drawHand(ctx, 28 + q * 168, 80, color);
      drawTargetRing(ctx, 206, chapter === 3 ? 54 : 76);
      if (chapter === 3 || chapter === 4) drawNote(ctx, 120, 55, COLORS.orange, 'F');
    }
    drawSceneLabel(ctx, labels[chapter - 1], 18, 18, color);
  }, [chapter]);
  return <Canvas canvasRef={ref} w={244} h={130} />;
};

function ChipRow<T extends string>({ values, value, onChange }: { values: Array<[T, string]>; value: T; onChange: (v: T) => void }) {
  return <div className="chip-row">{values.map(([key, label]) => <button key={key} className={`chip ${value === key ? 'selected' : ''}`} onClick={() => onChange(key)} aria-pressed={value === key}>{label}</button>)}</div>;
}

function Feedback({ tone, children }: { tone?: 'good' | 'bad' | ''; children: React.ReactNode }) {
  return <div className={`feedback ${tone || ''}`}>{children}</div>;
}

const errorMap = { plain18: 27.94, plain34: 28.54, residual18: 27.88, residual34: 25.03 };

function DegradationModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState<'18' | '34'>('18');
  const [method, setMethod] = useState<'plain' | 'residual'>('plain');
  const key = `${method}${depth}` as keyof typeof errorMap;
  const error = errorMap[key];
  useAnimatedCanvas(ref, 620, 260, (ctx) => {
    clearMusicScene(ctx, 620, 260);
    drawStaff(ctx, 28, 42, 315, 12);
    drawKeyboard(ctx, 28, 126, 315, 35);
    const wrong = method === 'plain' && depth === '34';
    drawNote(ctx, depth === '34' ? 290 : 190, wrong ? 64 : 76, wrong ? COLORS.red : COLORS.blue);
    drawTargetRing(ctx, 325, 76);
    ctx.strokeStyle = COLORS.line; ctx.strokeRect(392, 32, 180, 184);
    const barH = error * 5;
    ctx.fillStyle = method === 'residual' && depth === '34' ? COLORS.green : wrong ? COLORS.red : COLORS.blue;
    ctx.fillRect(445, 204 - barH, 70, barH);
    drawSceneLabel(ctx, `${error.toFixed(2)}%`, 452, 224 - barH, COLORS.ink);
    drawSceneLabel(ctx, 'Top-1 error ↓', 422, 238, COLORS.muted);
  }, [depth, method, error]);
  const good = method === 'residual' && depth === '34';
  const bad = method === 'plain' && depth === '34';
  return <div><Canvas canvasRef={ref} w={620} h={260} /><ChipRow values={[["plain", "普通网络"], ["residual", "残差网络"]]} value={method} onChange={setMethod} /><ChipRow values={[["18", "18 层"], ["34", "34 层"]]} value={depth} onChange={setDepth} /><div className="ctrl"><label>网络深度 <span className="val">{depth} 层</span></label><input aria-label="网络深度" type="range" min="0" max="1" value={depth === '18' ? 0 : 1} onChange={(e) => setDepth(e.target.value === '0' ? '18' : '34')} /></div><Feedback tone={good ? 'good' : bad ? 'bad' : ''}>{bad ? '普通 34 层的训练误差也更高：这是优化退化；BN 下前向与反向信号仍健康，不能简单归因于梯度消失。' : good ? '残差 34 层把更大深度转化为更低误差。' : '18 层网络作为同配方对照基线。'}</Feedback></div>;
}

function PathRaceModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(0);
  useAnimatedCanvas(ref, 620, 230, (ctx, time) => {
    const p = run ? clamp((time - run) / 1800, 0, 1) : 0;
    clearMusicScene(ctx, 620, 230);
    ['普通路径', '残差路径'].forEach((label, i) => {
      const y = 72 + i * 100;
      drawStaff(ctx, 35, y - 25, 500, 9);
      const x = 58 + p * 430;
      drawNote(ctx, x, y + (i === 0 ? Math.sin(p * 15) * 15 : 0), i === 0 ? COLORS.red : COLORS.green);
      drawTargetRing(ctx, 520, y);
      drawSceneLabel(ctx, label, 35, y - 36, i === 0 ? COLORS.red : COLORS.green);
    });
  }, [run]);
  return <div><Canvas canvasRef={ref} w={620} h={230} /><div className="step-ctrl"><button className="tiny" onClick={() => setRun(performance.now())}>开始同场演奏</button><button className="tiny ghost" onClick={() => setRun(0)}>重置</button></div><Feedback tone={run ? 'good' : ''}>{run ? '相同起点下，残差路径保留底音，只学习修正量。' : '两条路径将从同一输入同时出发。'}</Feedback></div>;
}

const stages = [
  ['conv1', '112×112', '64'], ['conv2_x', '56×56', '64'], ['conv3_x', '28×28', '128'], ['conv4_x', '14×14', '256'], ['conv5_x', '7×7', '512'],
] as const;

function StageModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  useAnimatedCanvas(ref, 620, 250, (ctx) => {
    clearMusicScene(ctx, 620, 250);
    stages.forEach(([name], i) => {
      const x = 55 + i * 102;
      ctx.fillStyle = i === stage ? COLORS.blue : '#fff'; ctx.strokeStyle = i === stage ? COLORS.orange : COLORS.line; ctx.lineWidth = i === stage ? 3 : 1;
      ctx.fillRect(x, 72, 78, 42); ctx.strokeRect(x, 72, 78, 42);
      drawSceneLabel(ctx, name, x + 10, 98, i === stage ? '#fff' : COLORS.ink);
      if (i < 4) { ctx.strokeStyle = i < stage ? COLORS.blue : COLORS.line; ctx.beginPath(); ctx.moveTo(x + 78, 93); ctx.lineTo(x + 102, 93); ctx.stroke(); }
    });
    const [name, size, channels] = stages[stage];
    ctx.fillStyle = '#fff'; ctx.strokeStyle = COLORS.line; ctx.fillRect(150, 145, 320, 72); ctx.strokeRect(150, 145, 320, 72);
    drawSceneLabel(ctx, `${name}  ·  ${size}  ·  ${channels} 通道`, 188, 180, COLORS.blue);
  }, [stage]);
  return <div><Canvas canvasRef={ref} w={620} h={250} /><ChipRow values={stages.map(([name], i) => [String(i), name] as [string, string])} value={String(stage)} onChange={(v) => setStage(Number(v))} /><Feedback>{`${stages[stage][0]}：空间尺寸 ${stages[stage][1]}，通道数 ${stages[stage][2]}。`}</Feedback></div>;
}

function ResidualPathModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'near' | 'far'>('near');
  const [run, setRun] = useState(0);
  const residual = mode === 'near' ? 0.08 : 0.55;
  useAnimatedCanvas(ref, 620, 260, (ctx, time) => {
    const p = run ? clamp((time - run) / 1600, 0, 1) : 0;
    clearMusicScene(ctx, 620, 260);
    const x0 = 80, y = 150;
    ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.bezierCurveTo(180, 25, 420, 25, 520, y); ctx.stroke();
    ctx.strokeStyle = COLORS.orange; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(220, y); ctx.lineTo(350, y); ctx.lineTo(520, y); ctx.stroke();
    ['W₁', 'W₂'].forEach((label, i) => { const x = 210 + i * 145; ctx.fillStyle = '#fff'; ctx.strokeStyle = COLORS.line; ctx.fillRect(x, 125, 64, 50); ctx.strokeRect(x, 125, 64, 50); drawSceneLabel(ctx, label, x + 20, 155, COLORS.ink); });
    drawNote(ctx, 80 + p * 440, y, p >= 1 ? COLORS.green : COLORS.blue);
    drawSceneLabel(ctx, `x = 0.72`, 54, 215, COLORS.blue); drawSceneLabel(ctx, `F(x) = ${residual.toFixed(2)}`, 250, 215, COLORS.orange); drawSceneLabel(ctx, `H(x) = ${(0.72 + residual).toFixed(2)}`, 440, 215, COLORS.green);
  }, [mode, run, residual]);
  return <div><Canvas canvasRef={ref} w={620} h={260} /><ChipRow values={[["near", "目标接近恒等"], ["far", "目标差异较大"]]} value={mode} onChange={(v) => { setMode(v); setRun(0); }} /><div className="step-ctrl"><button className="tiny" onClick={() => setRun(performance.now())}>比较两条路径</button></div><Feedback tone={mode === 'near' ? 'good' : ''}>{mode === 'near' ? '目标接近输入时，残差分支只需学习一个小修正。' : '残差仍能表达大变化，但接近恒等时优势最直观。'}</Feedback></div>;
}

function AdditionModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [residual, setResidual] = useState(0);
  const [match, setMatch] = useState<'yes' | 'no'>('yes');
  const y = 0.6 + residual;
  useAnimatedCanvas(ref, 620, 250, (ctx) => {
    clearMusicScene(ctx, 620, 250);
    ctx.strokeStyle = COLORS.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(70, 150); ctx.lineTo(550, 150); ctx.stroke();
    [0, .25, .5, .75, 1].forEach((v) => { const x = 70 + v * 480; ctx.beginPath(); ctx.moveTo(x, 144); ctx.lineTo(x, 156); ctx.stroke(); drawSceneLabel(ctx, v.toFixed(2), x - 10, 178, COLORS.muted); });
    const bx = 70 + .6 * 480, ox = 70 + clamp(y, 0, 1) * 480;
    drawNote(ctx, bx, 112, COLORS.blue, 'x');
    ctx.strokeStyle = match === 'yes' ? COLORS.orange : COLORS.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx, 112); ctx.lineTo(ox, 112); ctx.stroke();
    drawTargetRing(ctx, 70 + .85 * 480, 112);
    drawNote(ctx, ox, 112, match === 'yes' && Math.abs(y - .85) < .03 ? COLORS.green : match === 'no' ? COLORS.red : COLORS.orange, 'y');
    drawSceneLabel(ctx, match === 'yes' ? `0.60 + ${residual.toFixed(2)} = ${y.toFixed(2)}` : '64 通道 + 128 通道：不可直接相加', 170, 54, match === 'yes' ? COLORS.ink : COLORS.red);
  }, [residual, match, y]);
  const good = match === 'yes' && Math.abs(y - .85) < .03;
  return <div><Canvas canvasRef={ref} w={620} h={250} /><ChipRow values={[["yes", "维度一致"], ["no", "维度不一致"]]} value={match} onChange={setMatch} /><div className="ctrl"><label>残差 F(x) <span className="val">{residual.toFixed(2)}</span></label><input aria-label="残差" type="range" min="-40" max="40" step="5" value={Math.round(residual * 100)} onChange={(e) => setResidual(Number(e.target.value) / 100)} /></div><Feedback tone={match === 'no' ? 'bad' : good ? 'good' : ''}>{match === 'no' ? '通道数不同，不能直接逐元素相加。' : good ? 'y = 0.85，修正量正好补齐目标。' : '拖动修正量，观察输出沿数轴同步变化。'}</Feedback></div>;
}

function ShortcutModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'A' | 'B' | 'C'>('B');
  const [transition, setTransition] = useState<'same' | 'increase'>('increase');
  useAnimatedCanvas(ref, 620, 250, (ctx) => {
    clearMusicScene(ctx, 620, 250);
    const outputChannels = transition === 'same' ? '64 通道' : '128 通道';
    drawSceneLabel(ctx, '64 通道', 40, 126, COLORS.blue); drawSceneLabel(ctx, outputChannels, 500, 126, COLORS.green);
    ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(105, 120); ctx.lineTo(510, 120); ctx.stroke();
    const needsAdapter = transition === 'increase' || mode === 'C';
    ctx.strokeStyle = needsAdapter ? (mode === 'A' ? COLORS.orange : COLORS.purple) : COLORS.green; ctx.beginPath(); ctx.moveTo(105, 120); ctx.bezierCurveTo(200, 32, 410, 32, 510, 120); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = COLORS.line; ctx.fillRect(250, 98, 110, 44); ctx.strokeRect(250, 98, 110, 44); drawSceneLabel(ctx, '3×3 主分支', 266, 125, COLORS.ink);
    const routeLabel = transition === 'same' && mode !== 'C' ? '恒等，无参数' : mode === 'A' ? '补零，无参数' : mode === 'B' ? '变维处 1×1' : '每处都 1×1';
    drawSceneLabel(ctx, routeLabel, 245, 55, needsAdapter ? (mode === 'A' ? COLORS.orange : COLORS.purple) : COLORS.green);
    const cost = transition === 'same' && mode !== 'C' ? 28 : mode === 'A' ? 70 : mode === 'B' ? 115 : 180; ctx.fillStyle = COLORS.line; ctx.fillRect(205, 190, 230, 14); ctx.fillStyle = mode === 'C' ? COLORS.purple : COLORS.blue; ctx.fillRect(205, 190, cost, 14); drawSceneLabel(ctx, '额外捷径成本', 95, 202, COLORS.muted);
  }, [mode, transition]);
  const text = transition === 'same' && mode !== 'C' ? '尺寸不变时，A 与 B 都直接使用无参数恒等捷径。' : mode === 'A' ? 'A 在变维处补零，新通道没有残差学习。' : mode === 'B' ? 'B 只在变维处投影，精度与成本更均衡。' : 'C 在所有捷径上投影，略好但引入更多参数。';
  return <div><Canvas canvasRef={ref} w={620} h={250} /><ChipRow values={[["same", "尺寸不变"], ["increase", "通道增加"]]} value={transition} onChange={setTransition} /><ChipRow values={[["A", "A 零填充"], ["B", "B 变维时投影"], ["C", "C 全部投影"]]} value={mode} onChange={setMode} /><Feedback tone={mode === 'B' || (transition === 'same' && mode !== 'C') ? 'good' : ''}>{text}</Feedback></div>;
}

const forward = [
  ['输入', '224×224×3', '原始图像'], ['conv1', '112×112×64', '7×7 卷积，步长 2'], ['conv2_x', '56×56×64', '3 个基本块'], ['conv3_x', '28×28×128', '4 个基本块'], ['conv4_x', '14×14×256', '6 个基本块'], ['conv5_x', '7×7×512', '3 个基本块'], ['平均池化', '1×1×512', '每通道一个值'], ['fc1000', '1000', '类别分数'],
] as const;

function ForwardModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  useAnimatedCanvas(ref, 660, 240, (ctx) => {
    clearMusicScene(ctx, 660, 240);
    forward.forEach(([name], i) => { const x = 28 + i * 77; ctx.fillStyle = i === step ? COLORS.blue : '#fff'; ctx.strokeStyle = i === step ? COLORS.orange : COLORS.line; ctx.fillRect(x, 80, 62, 42); ctx.strokeRect(x, 80, 62, 42); drawSceneLabel(ctx, name, x + 5, 105, i === step ? '#fff' : COLORS.ink); if (i < 7) { ctx.strokeStyle = i < step ? COLORS.blue : COLORS.line; ctx.beginPath(); ctx.moveTo(x + 62, 101); ctx.lineTo(x + 77, 101); ctx.stroke(); } });
    drawSceneLabel(ctx, forward[step][1], 240, 170, COLORS.blue); drawSceneLabel(ctx, forward[step][2], 240, 199, COLORS.ink);
  }, [step]);
  return <div><Canvas canvasRef={ref} w={660} h={240} /><div className="step-ctrl"><button className="tiny ghost" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>上一步</button><span className="step-label"><b>{step + 1}</b> / {forward.length}</span><button className="tiny" onClick={() => setStep((v) => Math.min(forward.length - 1, v + 1))} disabled={step === forward.length - 1}>下一步</button><button className="tiny ghost" onClick={() => setStep(0)}>重置</button></div><Feedback>{`${forward[step][0]}：${forward[step][1]}，${forward[step][2]}。`}</Feedback></div>;
}

const lrs = [0.001, 0.01, 0.1, 0.3];
function LearningRateModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(2);
  const lr = lrs[index];
  useAnimatedCanvas(ref, 620, 260, (ctx, time) => {
    clearMusicScene(ctx, 620, 260); drawMetronome(ctx, 110, 100, time * lr * 3);
    ctx.strokeStyle = COLORS.line; ctx.strokeRect(250, 34, 320, 155);
    ctx.strokeStyle = lr === .1 ? COLORS.green : lr > .1 ? COLORS.red : COLORS.orange; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= 280; x += 4) { const t = x / 280; const base = lr > .1 ? 52 + Math.sin(t * 30) * 25 : 120 * Math.exp(-t * (lr === .1 ? 4 : 1.3)); const y = 168 - base; if (x === 0) ctx.moveTo(270, y); else ctx.lineTo(270 + x, y); } ctx.stroke();
    drawSceneLabel(ctx, '损失走势（示意）', 350, 219, COLORS.muted); drawSceneLabel(ctx, `lr = ${lr}`, 54, 178, COLORS.blue);
  }, [lr]);
  const tone = lr === .1 ? 'good' : lr > .1 ? 'bad' : '';
  return <div><Canvas canvasRef={ref} w={620} h={260} /><div className="ctrl"><label>学习率 <span className="val">{lr}</span></label><input aria-label="学习率" type="range" min="0" max="3" step="1" value={index} onChange={(e) => setIndex(Number(e.target.value))} /></div><div className="step-ctrl"><button className="tiny ghost" disabled={index === 0} onClick={() => setIndex(Math.max(0, index - 1))}>下降十倍</button></div><Feedback tone={tone}>{lr === .1 ? '0.1 是论文起始值；误差停滞后除以 10。' : lr > .1 ? '步幅过大，示意轨迹发生振荡。' : '步幅较小，更新更稳但推进更慢。'}</Feedback></div>;
}

type BlockVariant = 'basic' | 'bottleneck';
function BlockModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [variant, setVariant] = useState<BlockVariant>('basic');
  const nodes = variant === 'basic' ? ['输入', '3×3', '3×3', '相加', '捷径'] : ['输入', '1×1 降维', '3×3', '1×1 恢复', '相加', '捷径'];
  const [node, setNode] = useState(0);
  useEffect(() => setNode(0), [variant]);
  useAnimatedCanvas(ref, 660, 300, (ctx) => {
    clearMusicScene(ctx, 660, 300);
    const main = nodes.filter((n) => n !== '捷径');
    main.forEach((name, i) => { const x = 35 + i * (500 / Math.max(1, main.length - 1)); ctx.fillStyle = i === node ? COLORS.blue : '#fff'; ctx.strokeStyle = i === node ? COLORS.orange : COLORS.line; ctx.lineWidth = i === node ? 3 : 1; ctx.fillRect(x, 120, 90, 52); ctx.strokeRect(x, 120, 90, 52); drawSceneLabel(ctx, name, x + 9, 151, i === node ? '#fff' : COLORS.ink); if (i < main.length - 1) { ctx.strokeStyle = i < node ? COLORS.blue : COLORS.line; ctx.beginPath(); ctx.moveTo(x + 90, 146); ctx.lineTo(x + 500 / Math.max(1, main.length - 1), 146); ctx.stroke(); } });
    ctx.strokeStyle = COLORS.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, 120); ctx.bezierCurveTo(160, 38, 500, 38, 590, 120); ctx.stroke();
    drawSceneLabel(ctx, variant === 'basic' ? '64 → 64 → 64' : '256 → 64 → 64 → 256', 226, 230, COLORS.blue);
    drawSceneLabel(ctx, variant === 'basic' ? 'ResNet-18 / 34' : 'ResNet-50 / 101 / 152', 226, 258, COLORS.muted);
  }, [variant, node, nodes.length]);
  return <div><Canvas canvasRef={ref} w={660} h={300} /><ChipRow values={[["basic", "基本块"], ["bottleneck", "瓶颈块"]]} value={variant} onChange={setVariant} /><ChipRow values={nodes.map((n, i) => [String(i), n] as [string, string])} value={String(node)} onChange={(v) => setNode(Number(v))} /><Feedback tone={variant === 'bottleneck' && node === 1 ? 'good' : ''}>{variant === 'basic' ? `${nodes[node]}：基本块用两个 3×3 卷积学习残差。` : node === 1 ? '1×1 降维把昂贵的 3×3 卷积放在较窄通道上。' : `${nodes[node]}：瓶颈块仍在末端与恒等路径相加。`}</Feedback></div>;
}

const depthEvidence = { '20': [8.75, .27], '56': [6.97, .85], '110': [6.43, 1.7], '1202': [7.93, 19.4] } as const;
function LimitsModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState<keyof typeof depthEvidence>('20');
  const [error, params] = depthEvidence[depth];
  useAnimatedCanvas(ref, 620, 260, (ctx) => {
    clearMusicScene(ctx, 620, 260); ctx.strokeStyle = COLORS.line; ctx.strokeRect(35, 35, 550, 185);
    const heights = [error * 15, Math.log10(params + 1) * 95]; const labels = ['测试误差 %', '参数量（对数示意）'];
    heights.forEach((h, i) => { const x = 155 + i * 240; ctx.fillStyle = depth === '110' ? COLORS.green : depth === '1202' ? COLORS.red : COLORS.blue; ctx.fillRect(x, 205 - h, 90, h); drawSceneLabel(ctx, i === 0 ? `${error}%` : `${params}M`, x + 20, 190 - h, COLORS.ink); drawSceneLabel(ctx, labels[i], x - 15, 240, COLORS.muted); });
  }, [depth, error, params]);
  return <div><Canvas canvasRef={ref} w={620} h={260} /><ChipRow values={Object.keys(depthEvidence).map((d) => [d as keyof typeof depthEvidence, `${d} 层`])} value={depth} onChange={setDepth} /><Feedback tone={depth === '110' ? 'good' : depth === '1202' ? 'bad' : ''}>{depth === '110' ? '110 层达到 6.43±0.16%，是表中最佳 ResNet。' : depth === '1202' ? '1202 层能优化，却因过拟合回升到 7.93%。' : `${depth} 层：测试误差 ${error}%，参数量 ${params}M。`}</Feedback></div>;
}

const resultSets = {
  crop: [['plain-34', 28.54], ['ResNet-34', 25.03], ['ResNet-50', 22.85], ['ResNet-152', 21.43]],
  single: [['VGG-16', 7.1], ['ResNet-34C', 5.60], ['ResNet-101', 4.60], ['ResNet-152', 4.49]],
  ensemble: [['VGG', 7.32], ['GoogLeNet', 6.66], ['ResNet ensemble', 3.57]],
  coco: [['Faster R-CNN VGG-16', 21.2], ['Faster R-CNN ResNet-101', 27.2]],
} as const;
function ResultsModule() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [metric, setMetric] = useState<keyof typeof resultSets>('crop');
  const [start, setStart] = useState(0);
  const rows = resultSets[metric];
  const higherBetter = metric === 'coco';
  useAnimatedCanvas(ref, 660, 260, (ctx, time) => {
    const p = start ? clamp((time - start) / 1800, 0, 1) : 0;
    clearMusicScene(ctx, 660, 260); drawSceneLabel(ctx, higherBetter ? 'mAP 越高越好' : '误差越低越好', 32, 26, COLORS.muted);
    const max = Math.max(...rows.map((r) => r[1])); const min = Math.min(...rows.map((r) => r[1]));
    rows.forEach(([name, value], i) => { const y = 60 + i * 45; ctx.strokeStyle = COLORS.line; ctx.beginPath(); ctx.moveTo(180, y); ctx.lineTo(590, y); ctx.stroke(); const normalized = higherBetter ? (value - min) / Math.max(.01, max - min) : (max - value) / Math.max(.01, max - min); const x = 210 + p * (180 + normalized * 170); const best = value === (higherBetter ? max : min); ctx.fillStyle = best ? COLORS.green : COLORS.blue; ctx.beginPath(); ctx.arc(x, y, best ? 9 : 7, 0, Math.PI * 2); ctx.fill(); drawSceneLabel(ctx, name, 28, y + 5, best ? COLORS.green : COLORS.ink); drawSceneLabel(ctx, `${value}%`, 600, y + 5, best ? COLORS.green : COLORS.muted); });
  }, [metric, start, rows, higherBetter]);
  const message = metric === 'crop' ? '10-crop Top-1：ResNet-34 为 25.03%，普通 34 层为 28.54%。' : metric === 'single' ? '单模型验证 Top-5：ResNet-152 为 4.49%。' : metric === 'ensemble' ? '集成测试 Top-5：3.57%，不能与单模型 4.49% 混用。' : 'COCO mAP@[.5,.95]：ResNet-101 为 27.2%，比 VGG-16 的 21.2% 高 6.0 个点。';
  return <div><Canvas canvasRef={ref} w={660} h={260} /><ChipRow values={[["crop", "10-crop Top-1"], ["single", "单模型 Top-5"], ["ensemble", "集成 Top-5"], ["coco", "COCO 检测 mAP"]]} value={metric} onChange={(v) => { setMetric(v); setStart(0); }} /><div className="step-ctrl"><button className="tiny" onClick={() => setStart(performance.now())}>开始比较</button><button className="tiny ghost" onClick={() => setStart(0)}>重置</button></div><Feedback tone={start ? 'good' : ''}>{start ? message : '选择同一评测协议，再启动比较。'}</Feedback></div>;
}

export const ResNetModule: React.FC<WidgetProps> = ({ moduleId }) => {
  const component = useMemo(() => {
    switch (moduleId) {
      case '1.1': return <DegradationModule />;
      case '1.2': return <PathRaceModule />;
      case '2.1': return <StageModule />;
      case '3.1': return <ResidualPathModule />;
      case '4.1': return <AdditionModule />;
      case '5.1': return <ShortcutModule />;
      case '6.1': return <ForwardModule />;
      case '7.1': return <LearningRateModule />;
      case '8.1': return <BlockModule />;
      case '9.1': return <LimitsModule />;
      case '10.1': return <ResultsModule />;
      default: return <Feedback tone="bad">组件编号未匹配。</Feedback>;
    }
  }, [moduleId]);
  return component;
};
