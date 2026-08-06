import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawSummitFlag, drawCurve, drawInset, lerp } from './climbKit';

// §7 M7.1 步幅与收敛 —— P1 学习率滑块（对数）+ 损失曲线（hybrid）
// 论文 §3.4：lr 0.1 起，误差平台期除以 10；过大发散，过小收敛慢。

const W = 560;
const H = 250;

function lossSeries(lr: number): number[] {
  // lr 越小收敛越慢；lr 过大则发散
  const pts: number[] = [];
  const loglr = Math.log10(lr); // 0.001 → -3, 0.1 → -1, 1.0 → 0
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    let v: number;
    if (loglr > 0.3) {
      // 发散：先降后爆
      v = 3.2 - 1.2 * t + Math.exp((loglr - 0.3) * 4 * t) * 0.6;
    } else {
      // 收敛：指数下降，速度取决于学习率
      const rate = Math.pow(10, loglr + 1.6); // 相对速度
      v = 2.6 * Math.exp(-t * rate * 2.2) + 0.28;
    }
    pts.push(Math.min(v, 8));
  }
  return pts;
}

export const ModLR: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ lr: 0.1 });
  const rafRef = useRef<number | null>(null);
  const [lr, setLr] = useState(0.1);
  const [feedback, setFeedback] = useState({
    text: '学习率 0.1：损失稳定下降——这正是论文的起始值。',
    cls: 'good',
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

    const render = (s: { lr: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      const loglr = Math.log10(s.lr);
      // 左侧：登山者步幅
      const stride = lerp(0.08, 0.95, (loglr + 3) / 3); // 对数映射
      const x = 60;
      const bob = Math.sin(performance.now() / 350) * (s.lr > 0.5 ? 6 : 2);
      const y = H - 46 - stride * 90 - (s.lr > 0.5 ? 8 : 0);
      drawClimber(ctx, x, y + bob, { lean: s.lr > 0.5 ? 0.9 : 0.15, tired: s.lr < 0.005 ? 0.8 : s.lr > 0.5 ? 0.9 : 0.1 });
      // 山坡
      ctx.strokeStyle = SC.mountainDark;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, H - 30);
      ctx.lineTo(120, H - 30 - 60);
      ctx.lineTo(200, H - 30 - 100);
      ctx.stroke();
      drawSummitFlag(ctx, 206, H - 30 - 126, performance.now() / 1000);
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('步幅 ∝ 学习率', 20, 24);
      ctx.fillStyle = s.lr > 0.5 ? SC.steep : s.lr < 0.005 ? SC.inkMuted : SC.rope;
      ctx.fillText(
        s.lr > 0.5 ? '太大：踉跄失衡' : s.lr < 0.005 ? '太小：原地磨蹭' : '适中：稳步前进',
        20,
        44
      );

      // 右侧：损失曲线
      const rect = { x: 250, y: 34, w: 290, h: 180 };
      drawInset(ctx, rect, { label: '训练损失' });
      ctx.strokeStyle = '#eef1f7';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gy = rect.y + (rect.h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(rect.x, gy);
        ctx.lineTo(rect.x + rect.w, gy);
        ctx.stroke();
      }
      const pts = lossSeries(s.lr);
      const col = s.lr > 0.5 ? SC.steep : s.lr < 0.005 ? SC.inkMuted : SC.rope;
      drawCurve(ctx, { x: rect.x + 8, y: rect.y + 8, w: rect.w - 16, h: rect.h - 16 }, pts, col, {
        fill: true,
        lineWidth: 2.2,
      });
      ctx.fillStyle = SC.inkMuted;
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText('epoch →', rect.x + rect.w - 46, rect.y + rect.h - 6);
      ctx.fillStyle = col;
      ctx.fillText('lr = ' + s.lr, rect.x + 10, rect.y + rect.h - 6);

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
    const v = Number(e.target.value);
    stateRef.current.lr = v;
    setLr(v);
    if (v > 0.5) {
      setFeedback({ text: '学习率过大（>0.5）：一步跨空，损失震荡甚至发散——红色危险区。', cls: 'bad' });
    } else if (v < 0.005) {
      setFeedback({ text: '学习率过小（<0.005）：收敛太慢，训练到天荒地老也下不来。', cls: '' });
    } else {
      setFeedback({ text: '学习率适中（0.01–0.1）：损失稳定下降——论文从 0.1 起步，平台期再除以 10。', cls: 'good' });
    }
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="ctrl">
        <label>
          学习率 η <span className="val">{lr.toFixed(3)}</span>
        </label>
        <input
          type="range"
          min={0.001}
          max={1}
          step={0.001}
          value={lr}
          onChange={onChange}
        />
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModLR;
