import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawHold, drawRope, drawSummitFlag, drawSceneLabel } from './climbKit';

// §6 M6.1 前向之旅 —— P2 步进可视化（5 个 stage）
// 论文 Table 1：conv1 → conv2_x(×3) → conv3_x(×4) → conv4_x(×6) → conv5_x(×3) → avgpool → fc。

const W = 560;
const H = 250;

const STEPS = [
  {
    name: 'conv1 + pool',
    shape: '56×56×64',
    detail: '7×7 卷积（stride 2）+ 3×3 最大池化：224×224×3 → 112×112×64 → 56×56×64，提取底层边缘。',
    blocks: '1',
  },
  {
    name: 'conv2_x',
    shape: '56×56×64',
    detail: '3 个残差块（2×3×3），全为恒等捷径，特征图尺寸不变。',
    blocks: '×3',
  },
  {
    name: 'conv3_x',
    shape: '28×28×128',
    detail: '4 个残差块，第一个块用投影捷径：56²×64 → 28²×128（通道翻倍、尺寸减半）。',
    blocks: '×4',
  },
  {
    name: 'conv4_x',
    shape: '14×14×256',
    detail: '6 个残差块，第一个块用投影捷径：28²×128 → 14²×256。',
    blocks: '×6',
  },
  {
    name: 'conv5_x + head',
    shape: '7×7×512 → 1000',
    detail: '3 个残差块后接全局平均池化和 1000 类全连接 + softmax：14²×256 → 7²×512 → 分类输出。',
    blocks: '×3',
  },
];

export const ModForward: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ step: 0 });
  const rafRef = useRef<number | null>(null);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState({ text: STEPS[0].detail, cls: '' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (s: { step: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      // 主干横向流（5 个节点 + 输入）
      const nodes = [
        { x: 66, y: 118, label: '输入', sub: '224²×3' },
        { x: 158, y: 118, label: 'conv1+pool', sub: '56²×64' },
        { x: 250, y: 118, label: 'conv2_x', sub: '56²×64' },
        { x: 342, y: 118, label: 'conv3_x', sub: '28²×128' },
        { x: 434, y: 118, label: 'conv4_x', sub: '14²×256' },
        { x: 526, y: 118, label: 'conv5_x', sub: '7²×512' },
      ];
      // 连接线（已走过的绿色，未走的灰色）
      for (let i = 0; i < nodes.length - 1; i++) {
        const done = i < s.step + 1;
        ctx.strokeStyle = done ? SC.rope : SC.line;
        ctx.lineWidth = done ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x + 24, 118);
        ctx.lineTo(nodes[i + 1].x - 24, 118);
        ctx.stroke();
      }
      // 节点
      nodes.forEach((n, i) => {
        const active = i === s.step + 1;
        const isInput = i === 0;
        ctx.fillStyle = isInput ? '#fff' : active ? SC.climber : '#fff';
        ctx.strokeStyle = active ? SC.climber : SC.line;
        ctx.lineWidth = active ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(n.x - 24, n.y - 26, 48, 52, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = active ? '#fff' : SC.ink;
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - 4);
        ctx.fillStyle = active ? 'rgba(255,255,255,0.85)' : SC.inkMuted;
        ctx.font = '9px "Segoe UI", sans-serif';
        ctx.fillText(n.sub, n.x, n.y + 14);
        ctx.textAlign = 'left';
        if (active) {
          ctx.strokeStyle = SC.flag;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y - 34, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 底部：当前 stage 的块数徽标
      const cur = STEPS[s.step];
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillText(cur.name + '　残差块 ' + cur.blocks + '　输出 ' + cur.shape, 20, 200);

      // 登山者沿主干前进（当前 step 位置）
      const cx = nodes[s.step + 1].x;
      const bob = Math.sin(performance.now() / 400) * 2;
      drawClimber(ctx, cx, 52 + bob, { lean: 0 });
      drawRope(ctx, 40, 118, nodes[s.step + 1].x, 118, SC.rope, false, 0);
      drawSummitFlag(ctx, 536, 40, performance.now() / 1000, '');

      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    };

    const tick = () => {
      render(stateRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => {
      stop();
      disconnect();
    };
  }, []);

  const go = (next: number) => {
    const s = Math.max(0, Math.min(STEPS.length - 1, next));
    stateRef.current.step = s;
    setStep(s);
    setFeedback({ text: STEPS[s].detail, cls: s === STEPS.length - 1 ? 'good' : '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button type="button" className="tiny ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          ◀ 上一步
        </button>
        <span className="step-label">
          第 <b>{step + 1}</b> / {STEPS.length} 阶段
        </span>
        <button type="button" className="tiny" onClick={() => go(step + 1)} disabled={step === STEPS.length - 1}>
          {step === STEPS.length - 1 ? '已完成' : '下一步 ▶'}
        </button>
      </div>
      <div className="step-desc">{STEPS[step].name}：{STEPS[step].shape}</div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModForward;
