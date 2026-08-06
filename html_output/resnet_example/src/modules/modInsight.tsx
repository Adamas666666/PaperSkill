import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawHold, drawSummitFlag, drawSceneLabel, lerp } from './climbKit';

// §3 M3.1 两种起步 —— P3 同步对比（共享开始按钮，两栏同时间轴）
// 论文 §3.1：学 H(x) 与学 F(x)=H(x)-x 的起点差异。

const W = 560;
const H = 250;
const PANEL_W = 250;
const DURATION = 3.2; // 秒

export const ModInsight: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ running: false, t: 0 });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState({
    text: '按下「开始对比」，同时观察两种"起步方式"面对同一个目标。',
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

    const renderPanel = (
      px: number,
      style: 'old' | 'new',
      t: number
    ) => {
      const baseY = H - 34;
      const targetY = 46;
      // 目标岩点 + 山
      drawHold(ctx, px + PANEL_W / 2, targetY, 6, SC.flag);
      ctx.fillStyle = SC.mountain;
      ctx.beginPath();
      ctx.moveTo(px + 8, baseY + 8);
      ctx.lineTo(px + PANEL_W / 2, targetY + 26);
      ctx.lineTo(px + PANEL_W - 8, baseY + 8);
      ctx.closePath();
      ctx.fill();

      if (style === 'old') {
        // 从谷底反复起跳
        const jumpT = (t * 1.6) % 1;
        const x = px + PANEL_W / 2;
        const y = baseY - Math.sin(jumpT * Math.PI) * 150;
        drawClimber(ctx, x, y, { lean: 0.7, tired: 0.9 });
        ctx.strokeStyle = SC.steep;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(px + 40, targetY);
        ctx.lineTo(px + PANEL_W - 40, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        if (t > DURATION) {
          drawSceneLabel(ctx, '多次起跳仍够不到', px + PANEL_W / 2, H - 6, SC.steep);
        }
      } else {
        // 站在当前岩点，逐级上移
        const steps = 4;
        const prog = Math.min(1, t / DURATION);
        for (let i = 0; i < steps; i++) {
          const yy = lerp(baseY, targetY, (i + 1) / steps);
          drawHold(ctx, px + PANEL_W / 2, yy, 4, SC.hold);
        }
        const yy = lerp(baseY, targetY, prog);
        drawClimber(ctx, px + PANEL_W / 2, yy + 4, { lean: 0.1 });
        if (t > DURATION) {
          drawSceneLabel(ctx, '沿岩点稳步上移，到达目标', px + PANEL_W / 2, H - 6, SC.rope);
        }
      }
    };

    const render = (s: { running: boolean; t: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      // 左栏：直接学 H(x)
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = SC.steep;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(12, 14, PANEL_W, H - 34);
      ctx.fillStyle = SC.steep;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('直接学 H(x)：从谷底起跳', 22, 32);
      renderPanel(12, 'old', s.running ? s.t : 0);

      // 右栏：学残差 F(x)
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = SC.rope;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(W - PANEL_W - 12, 14, PANEL_W, H - 34);
      ctx.fillStyle = SC.rope;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('学残差 F(x)：站在当前岩点', W - PANEL_W - 2, 32);
      renderPanel(W - PANEL_W - 12, 'new', s.running ? s.t : 0);

      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    };

    const tick = () => {
      const s = stateRef.current;
      if (s.running) {
        s.t = (performance.now() - startTimeRef.current) / 1000;
        if (s.t >= DURATION) {
          s.running = false;
          s.t = DURATION;
          setFinished(true);
          setFeedback({
            text: '左栏红色：多次起跳仍够不到目标——从零学太难；右栏绿色：站在当前点微调，稳稳到达——学残差更稳。',
            cls: 'good',
          });
        }
      }
      render(s);
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

  const begin = () => {
    if (stateRef.current.running) return;
    startTimeRef.current = performance.now();
    stateRef.current.t = 0;
    stateRef.current.running = true;
    setStarted(true);
    setFinished(false);
    setFeedback({ text: '同一目标，两种起步：看左栏反复起跳，右栏稳步上移。', cls: '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button type="button" className="tiny" onClick={begin} disabled={started && !finished}>
          {finished ? '再次对比' : '开始对比'}
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModInsight;
