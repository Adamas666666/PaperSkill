import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawSceneLabel } from './climbKit';

// §8 M8.2 深度变体 —— P4 芯片（18/34/50/152 层）+ 误差条与 FLOPs
// 论文 Table 3/4：18→27.94、34→25.03、50→22.85、152→21.43（top-1 验证误差）
// FLOPs：18→1.8、34→3.6、50→3.8、152→11.3（GFLOPs）。

const W = 560;
const H = 250;

const VARIANTS = [
  {
    key: '18',
    label: 'ResNet-18',
    err: 27.94,
    flops: 1.8,
    desc: '18 层 ResNet top-1 误差 27.94%，与 plain-18（27.94%）相当，但收敛更快。',
    cls: 'good',
  },
  {
    key: '34',
    label: 'ResNet-34',
    err: 25.03,
    flops: 3.6,
    desc: '34 层 25.03%，比 plain-34（28.54%）低 3.5%——残差学习生效，退化被解决。',
    cls: 'good',
  },
  {
    key: '50',
    label: 'ResNet-50',
    err: 22.85,
    flops: 3.8,
    desc: '50 层（瓶颈块）22.85%，误差继续下降，FLOPs 仅 3.8G。',
    cls: 'good',
  },
  {
    key: '152',
    label: 'ResNet-152',
    err: 21.43,
    flops: 11.3,
    desc: '152 层 21.43%，单模型 top-5 4.49%——比此前所有集成结果还好，FLOPs 仍低于 VGG-19。',
    cls: 'good',
  },
];

const PLAIN_REF = { label: 'plain-34', err: 28.54 };

export const ModDepth: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ v: 3 });
  const rafRef = useRef<number | null>(null);
  const [v, setV] = useState(3);
  const [feedback, setFeedback] = useState({ text: VARIANTS[3].desc, cls: VARIANTS[3].cls });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (s: { v: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      const cur = VARIANTS[s.v];
      const maxErr = 29.5;
      const bx = 150;
      const bw = 330;

      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('ImageNet 验证 top-1 误差（%）——越低越好', 20, 30);

      // plain 参考（红）
      const py = 48;
      ctx.fillStyle = SC.steep;
      ctx.fillRect(bx, py, (PLAIN_REF.err / maxErr) * bw, 18);
      ctx.fillStyle = SC.ink;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText(PLAIN_REF.label + '（无残差）', bx - 130, py + 14);
      ctx.fillStyle = SC.steep;
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(PLAIN_REF.err.toFixed(2), bx + bw + 4, py + 14);
      ctx.textAlign = 'left';

      // 四个变体（越深越绿）
      const colors = [SC.rope, SC.rope, SC.climber, SC.flag];
      VARIANTS.forEach((va, i) => {
        const yy = 48 + (i + 1) * 34;
        const isCur = i === s.v;
        ctx.fillStyle = isCur ? colors[i] : '#d9e3d0';
        ctx.fillRect(bx, yy, (va.err / maxErr) * bw, 18);
        ctx.fillStyle = SC.ink;
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillText(va.label, bx - 130, yy + 14);
        ctx.fillStyle = isCur ? colors[i] : SC.inkMuted;
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(va.err.toFixed(2), bx + bw + 4, yy + 14);
        ctx.textAlign = 'left';
        // FLOPs 标签
        ctx.fillStyle = isCur ? SC.ink : SC.inkMuted;
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.fillText(va.flops.toFixed(1) + ' GFLOPs', bx + (va.err / maxErr) * bw + 8, yy + 14);
      });

      // 登山者：深度越深位置越高
      const climberY = 220 - (s.v + 1) * 20;
      const bob = Math.sin(performance.now() / 420) * 2;
      drawClimber(ctx, 40, climberY + bob, { lean: 0.1 });
      drawSceneLabel(ctx, cur.label + ' 层', 40, 240, colors[s.v]);

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

  const select = (i: number) => {
    stateRef.current.v = i;
    setV(i);
    setFeedback({ text: VARIANTS[i].desc, cls: VARIANTS[i].cls });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row">
        {VARIANTS.map((va, i) => (
          <button key={va.key} type="button" className={`chip ${i === v ? 'selected' : ''}`} onClick={() => select(i)}>
            {va.label}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModDepth;
