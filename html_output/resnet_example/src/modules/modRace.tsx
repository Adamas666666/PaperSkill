import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawProgressBar, drawSummitFlag, drawSceneLabel } from './climbKit';

// §10 M10.1 登顶竞赛 —— P8 结果竞赛 + 验证表
// 论文 Table 2/3：VGG-16 27.94、ResNet-34 25.03、ResNet-152 21.43（ImageNet 验证 top-1）。
// 进度按误差换算：误差越低 → 进度越快、登顶越早。

const W = 560;
const H = 250;

const RUNNERS = [
  { key: 'vgg', label: 'VGG-16', err: 27.94, color: SC.steep },
  { key: 'r34', label: 'ResNet-34', err: 25.03, color: SC.climber },
  { key: 'r152', label: 'ResNet-152', err: 21.43, color: SC.flag },
];

const DURATION = 3.6; // 秒

/** 误差 → 进度（0~1）：误差越低完成越快。 */
function errToProgress(err: number, t: number): number {
  // 归一化速度：21.43 → 1.0, 27.94 → ~0.72
  const speed = 1 - (err - 21) / 12;
  return Math.min(1, t * speed * 0.5);
}

export const ModRace: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ running: false, t: 0 });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState({
    text: '按下「开始竞赛」，看谁先登顶——误差越低，登顶越快。',
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

    const render = (s: { running: boolean; t: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      // 峰顶旗帜
      drawSummitFlag(ctx, W - 34, 30, performance.now() / 1000, '登顶');
      // 登顶线
      ctx.strokeStyle = SC.line;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(40, 24);
      ctx.lineTo(W - 60, 24);
      ctx.stroke();
      ctx.setLineDash([]);

      // 三条赛道
      RUNNERS.forEach((r, i) => {
        const y = 58 + i * 58;
        const prog = s.running ? errToProgress(r.err, s.t) : 0;
        drawProgressBar(ctx, { x: 40, y, w: W - 110, h: 24 }, prog, r.color, r.label);
        // 完成标记
        if (prog >= 1) {
          ctx.fillStyle = SC.flag;
          ctx.font = '14px "Segoe UI", sans-serif';
          ctx.fillText('🏁', W - 78, y + 18);
        }
      });

      // 结果表（结束后展示精确数值）
      const rect = { x: 40, y: 236 - 110, w: W - 80, h: 96 };
      if (s.t > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = SC.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = SC.ink;
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillText('ImageNet 验证集 top-1 误差（10-crop）', rect.x + 12, rect.y + 18);
        let ty = rect.y + 40;
        RUNNERS.forEach((r) => {
          const done = errToProgress(r.err, DURATION) >= 1;
          ctx.fillStyle = done ? SC.flag : SC.inkMuted;
          ctx.font = '10px "Segoe UI", sans-serif';
          ctx.fillText('● ' + r.label + '　' + r.err.toFixed(2) + '%' + (done ? '　已登顶 🏁' : ''), rect.x + 14, ty);
          ty += 20;
        });
      }

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
            text: 'VGG-16 top-1 27.94%，ResNet-34 25.03%，ResNet-152 21.43%——残差学习让深度真正转化为精度。',
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
    setFeedback({ text: '竞赛进行中——误差越低，登顶越快。', cls: '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button type="button" className="tiny" onClick={begin} disabled={started && !finished}>
          {finished ? '再次竞赛' : '开始竞赛'}
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModRace;
