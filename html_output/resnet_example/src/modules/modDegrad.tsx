import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawSummitFlag, drawCurve, drawInset, lerp } from './climbKit';

// §1 M1.1 退化的陡坡 —— P1 深度滑块 + 训练误差曲线（hybrid linked views）
// 论文 Fig.1：CIFAR-10 上 20 层 vs 56 层 plain 网络，更深的网络训练误差更高。

const W = 560;
const H = 250;

const DEPTH_MIN = 20;
const DEPTH_MAX = 56;

/** 按深度生成训练误差曲线：层数越深，收敛后误差越高（拟合 Fig.1 现象）。 */
function errorSeries(depth: number): number[] {
  const base = lerp(4.5, 13.5, (depth - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN));
  const pts: number[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    // 前段快速下降，后段平台；深度越大平台越高
    const drop = 26 * Math.exp(-t * 4.2);
    const plateau = base * (1 - Math.exp(-t * 1.4));
    pts.push(drop + plateau);
  }
  return pts;
}

export const ModDegrad: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ depth: 20 });
  const rafRef = useRef<number | null>(null);
  const [depth, setDepth] = useState(20);
  const [feedback, setFeedback] = useState({
    text: '从 20 层开始，观察训练误差随深度的变化。',
    cls: '',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (s: { depth: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      // 左半：山坡，坡度随深度变陡；右半：误差曲线
      const slope = lerp(0.18, 0.62, (s.depth - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN));
      // 山坡
      ctx.strokeStyle = SC.mountainDark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, H - 30);
      ctx.lineTo(120, H - 30 - slope * 170);
      ctx.lineTo(240, H - 30 - slope * 170 - 18);
      ctx.stroke();
      // 登山者（越陡越吃力）
      const tired = lerp(0.1, 0.95, (s.depth - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN));
      const bob = Math.sin(performance.now() / 500) * 2;
      drawClimber(ctx, 60, H - 34 - slope * 80 + bob, { lean: 0.6, tired });

      // 海拔标尺文字
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('深度：' + s.depth + ' 层', 20, 22);
      ctx.fillStyle = SC.inkMuted;
      ctx.fillText('山坡越来越陡', 20, 40);

      // 右半：误差曲线 inset
      const rect = { x: 260, y: 36, w: 280, h: 180 };
      drawInset(ctx, rect, { label: '训练误差 %（CIFAR-10 plain）' });
      // 网格
      ctx.strokeStyle = '#eef1f7';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gy = rect.y + (rect.h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(rect.x, gy);
        ctx.lineTo(rect.x + rect.w, gy);
        ctx.stroke();
      }
      // 20 层（参考线）与当前层
      drawCurve(ctx, { x: rect.x + 8, y: rect.y + 8, w: rect.w - 16, h: rect.h - 16 }, errorSeries(20), SC.rope, { lineWidth: 1.5 });
      const cur = errorSeries(s.depth);
      drawCurve(ctx, { x: rect.x + 8, y: rect.y + 8, w: rect.w - 16, h: rect.h - 16 }, cur, s.depth > 42 ? SC.steep : SC.climber, { lineWidth: 2.2 });
      // 图例
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillStyle = SC.rope;
      ctx.fillText('— 20 层', rect.x + 10, rect.y + rect.h - 6);
      ctx.fillStyle = s.depth > 42 ? SC.steep : SC.climber;
      ctx.fillText('— ' + s.depth + ' 层', rect.x + 70, rect.y + rect.h - 6);
      ctx.fillStyle = SC.inkMuted;
      ctx.fillText('迭代 →', rect.x + rect.w - 40, rect.y + rect.h - 6);

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = Number(e.target.value);
    stateRef.current.depth = d;
    setDepth(d);
    if (d <= 30) {
      setFeedback({ text: '20 层左右的网络可以正常训练，训练误差稳步下降。', cls: 'good' });
    } else if (d <= 42) {
      setFeedback({ text: '层数加深后，误差下降明显变慢，优化开始吃力。', cls: '' });
    } else if (d <= 48) {
      setFeedback({ text: '已经接近退化区：训练误差不降反升，网络"学不动"了。', cls: 'bad' });
    } else {
      setFeedback({
        text: '56 层的训练误差比 20 层更高——这不是过拟合，而是退化问题（论文 Fig.1）。',
        cls: 'bad',
      });
    }
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="ctrl">
        <label>
          网络深度 <span className="val">{depth} 层</span>
        </label>
        <input type="range" min={DEPTH_MIN} max={DEPTH_MAX} step={1} value={depth} onChange={onChange} />
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModDegrad;
