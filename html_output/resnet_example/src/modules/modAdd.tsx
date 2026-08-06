import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawInset, drawArrow, drawSceneLabel, clamp } from './climbKit';

// §4 M4.1 残差加法器 —— P6 拖拽（数轴上拖动 F 的把手）+ 数学视图
// 论文式 (1)：y = F(x, {Wᵢ}) + x；F=0 时是恒等映射。

const W = 560;
const H = 250;

const AXIS = { x0: 70, x1: 490, y: 118 };
const X_POS = 0.45; // x 固定在数轴 45% 处

function valToX(v: number): number {
  // 数值范围 [-2, +4] 映射到 [x0, x1]
  return AXIS.x0 + ((v + 2) / 6) * (AXIS.x1 - AXIS.x0);
}
function xToVal(x: number): number {
  return ((x - AXIS.x0) / (AXIS.x1 - AXIS.x0)) * 6 - 2;
}

export const ModAdd: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ f: 1.5 });
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [f, setF] = useState(1.5);
  const [feedback, setFeedback] = useState({
    text: '拖动橙色把手，调整残差 F，观察 y = x + F 的位置。',
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

    const xOf = (v: number) => valToX(v);

    const render = (s: { f: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      const x = xOf(X_POS * 6 - 2); // x = 1（固定）
      const y = clamp(x + s.f, -2, 4);
      const yx = xOf(y);

      // 数轴
      ctx.strokeStyle = SC.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(AXIS.x0 - 14, AXIS.y);
      ctx.lineTo(AXIS.x1 + 14, AXIS.y);
      ctx.stroke();
      // 刻度
      ctx.fillStyle = SC.inkMuted;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      for (let v = -2; v <= 4; v++) {
        const tx = xOf(v);
        ctx.beginPath();
        ctx.moveTo(tx, AXIS.y - 5);
        ctx.lineTo(tx, AXIS.y + 5);
        ctx.strokeStyle = SC.line;
        ctx.stroke();
        ctx.fillText(String(v), tx, AXIS.y + 18);
      }

      // x 标记（输入，蓝）
      ctx.fillStyle = SC.climber;
      ctx.beginPath();
      ctx.arc(x, AXIS.y, 6, 0, Math.PI * 2);
      ctx.fill();
      drawSceneLabel(ctx, 'x = 1', x, AXIS.y - 14, SC.climber);

      // 残差 F 箭头（橙）
      if (s.f >= 0) {
        drawArrow(ctx, x, AXIS.y - 26, yx, AXIS.y - 26, SC.flag, 7);
      } else {
        drawArrow(ctx, x, AXIS.y - 26, yx, AXIS.y - 26, SC.steep, 7);
      }
      drawSceneLabel(ctx, 'F = ' + s.f.toFixed(1), (x + yx) / 2, AXIS.y - 34, SC.flag);

      // y 标记（输出，绿）
      ctx.fillStyle = SC.rope;
      ctx.beginPath();
      ctx.arc(yx, AXIS.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawSceneLabel(ctx, 'y = ' + y.toFixed(1), yx, AXIS.y + 34, SC.rope);

      // 数学视图 inset
      const rect = { x: 70, y: 160, w: 420, h: 66 };
      drawInset(ctx, rect);
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillText('y = x + F(x)  =  ' + x.toFixed(1) + ' + (' + s.f.toFixed(1) + ')  =  ' + y.toFixed(1), rect.x + 14, rect.y + 40);
      if (Math.abs(s.f) < 0.05) {
        ctx.fillStyle = SC.rope;
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillText('F = 0：输出等于输入（恒等映射）', rect.x + 14, rect.y + 58);
      }

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

    // 拖拽处理
    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = W / rect.width;
      return (e.clientX - rect.left) * scale;
    };
    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const px = getPos(e);
      const v = clamp(xToVal(px), -2, 4);
      stateRef.current.f = v;
      setF(v);
      if (Math.abs(v) < 0.05) {
        setFeedback({ text: '残差为 0：输出等于输入——恒等映射，信息完整保留，绿色安全。', cls: 'good' });
      } else if (v > 0) {
        setFeedback({ text: '残差为正：y = x + F 比输入更靠近目标，网络正在学习有效更新。', cls: 'good' });
      } else {
        setFeedback({ text: '残差为负：输出反而回退——网络学偏了，这种情况应避免。', cls: 'bad' });
      }
    };
    const onUp = () => {
      draggingRef.current = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      stop();
      disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} style={{ cursor: 'grab', touchAction: 'none' }} />
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModAdd;
