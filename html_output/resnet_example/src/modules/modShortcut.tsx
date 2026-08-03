import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawHold, drawRope, drawSceneLabel, drawLegend } from './climbKit';

// §5 M5.1 捷径消融 —— P4 模式芯片（A/B/C）+ 消融条
// 论文 Table 3：A 25.03 / B 24.52 / C 24.19（ImageNet 34 层 top-1），plain-34 = 28.54。

const W = 560;
const H = 250;

const OPTIONS = [
  {
    key: 'A',
    label: 'A · 零填充',
    err: 25.03,
    params: 0,
    desc: '零填充：维度增加处补 0，不引入任何参数。top-1 误差 25.03%，已大幅优于 plain-34（28.54%）。',
    cls: 'good',
    rope: SC.rope,
    dash: false,
  },
  {
    key: 'B',
    label: 'B · 维度处投影',
    err: 24.52,
    params: 1,
    desc: '仅在维度变化处用 1×1 卷积投影（式 2）。误差降到 24.52%，略好于 A，参数增加很少。',
    cls: 'good',
    rope: SC.climber,
    dash: false,
  },
  {
    key: 'C',
    label: 'C · 全部投影',
    err: 24.19,
    params: 3,
    desc: '所有捷径都用投影（十三个投影捷径）。误差 24.19% 只比 B 好 0.3%，参数和显存却明显增加——不划算。',
    cls: '',
    rope: SC.flag,
    dash: true,
  },
];

export const ModShortcut: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ opt: 0 });
  const rafRef = useRef<number | null>(null);
  const [opt, setOpt] = useState(0);
  const [feedback, setFeedback] = useState({ text: OPTIONS[0].desc, cls: OPTIONS[0].cls });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (s: { opt: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      const o = OPTIONS[s.opt];
      // 岩壁 + 捷径示意（左侧）
      const baseY = H - 40;
      const topY = 54;
      const x1 = 110;
      const x2 = 230;
      // 岩壁两端
      drawHold(ctx, x1, baseY, 6);
      drawHold(ctx, x2, topY, 6, SC.flag);
      // 主路径（卷积主干）
      ctx.strokeStyle = SC.inkMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, baseY);
      ctx.lineTo(x1, baseY - 90);
      ctx.lineTo(x2, topY + 30);
      ctx.lineTo(x2, topY);
      ctx.stroke();
      // 捷径（当前选项的样式）
      drawRope(ctx, x1, baseY, x2, topY, o.rope, o.dash, 16);
      // 登山者沿捷径
      const bob = Math.sin(performance.now() / 500) * 2;
      drawClimber(ctx, (x1 + x2) / 2, (baseY + topY) / 2 + 8 + bob, { lean: 0.2, color: o.rope });
      drawSceneLabel(ctx, '捷径：' + o.label, (x1 + x2) / 2, (baseY + topY) / 2 - 16, o.rope);

      // 消融条（右侧）
      const bx = 300;
      const bw = 240;
      const maxErr = 29;
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('ImageNet 34 层 top-1 误差（%）', bx, 30);

      const bars = [
        { label: 'plain-34', err: 28.54, color: SC.steep },
        { label: 'A 零填充', err: 25.03, color: SC.rope },
        { label: 'B 维度投影', err: 24.52, color: SC.climber },
        { label: 'C 全部投影', err: 24.19, color: SC.flag },
      ];
      bars.forEach((b, i) => {
        const by = 44 + i * 30;
        const wbar = (b.err / maxErr) * bw;
        const isCur = (s.opt === 0 && i === 1) || (s.opt === 1 && i === 2) || (s.opt === 2 && i === 3);
        ctx.fillStyle = '#eef1f7';
        ctx.fillRect(bx, by, bw, 16);
        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, wbar, 16);
        ctx.fillStyle = SC.ink;
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText(b.label, bx, by + 30);
        ctx.fillStyle = b.color;
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(b.err.toFixed(2), bx + bw, by + 12);
        ctx.textAlign = 'left';
        if (isCur) {
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx - 3, by - 2, bw + 6, 20);
        }
      });

      // 参数量提示
      const paramNote = o.params === 0 ? '额外参数：0' : o.params === 1 ? '额外参数：仅维度变化处' : '额外参数：较多（十三个投影）';
      ctx.fillStyle = o.params >= 3 ? SC.flag : SC.inkMuted;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText(paramNote, bx, 44 + 4 * 30 + 6);

      drawLegend(ctx, [
        { color: SC.steep, label: 'plain 失败' },
        { color: SC.rope, label: '恒等捷径' },
      ], 20, H - 8);

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
    stateRef.current.opt = i;
    setOpt(i);
    setFeedback({ text: OPTIONS[i].desc, cls: OPTIONS[i].cls });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row">
        {OPTIONS.map((o, i) => (
          <button key={o.key} type="button" className={`chip ${i === opt ? 'selected' : ''}`} onClick={() => select(i)}>
            {o.label}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModShortcut;
