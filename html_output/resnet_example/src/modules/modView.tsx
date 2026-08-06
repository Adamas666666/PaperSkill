import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawClimber, drawHold, drawInset, drawSceneLabel } from './climbKit';

// §2 M2.1 观景台 —— P5 点击热区（3 个海拔位点）+ 固定 inset
// 论文 §1：深度网络自然地集成 低/中/高级特征。

const W = 560;
const H = 250;

const SPOTS = [
  {
    key: 'shallow',
    label: '浅层（边缘纹理）',
    y: 0.78,
    desc: '浅层网络关注边缘与纹理，感受野很小（约 5 像素），只能看到一棵树的局部。',
    cls: 'bad',
    f: { r: 3, color: SC.mountainDark, style: 'lines' },
  },
  {
    key: 'mid',
    label: '中层（局部形状）',
    y: 0.56,
    desc: '中层开始组合出局部形状（如轮子、眼睛、纹理斑块），感受野约 11 像素。',
    cls: '',
    f: { r: 4, color: SC.climber, style: 'blobs' },
  },
  {
    key: 'deep',
    label: '深层（语义部件）',
    y: 0.34,
    desc: '深层响应语义部件（鸟、汽车、完整物体），感受野约 23 像素，离分类目标最近。',
    cls: 'good',
    f: { r: 5, color: SC.rope, style: 'object' },
  },
];

const SPOT_X = 0.42;
const INSET = { x: 330, y: 34, w: 210, h: 180 };

export const ModView: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ spot: 0 });
  const rafRef = useRef<number | null>(null);
  const [spot, setSpot] = useState(0);
  const [feedback, setFeedback] = useState({
    text: SPOTS[0].desc,
    cls: SPOTS[0].cls,
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

    const render = (s: { spot: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      // 山体轮廓
      ctx.fillStyle = SC.mountain;
      ctx.beginPath();
      ctx.moveTo(0, H - 20);
      ctx.lineTo(W * 0.2, H * 0.4);
      ctx.lineTo(W * 0.44, H - 14);
      ctx.lineTo(W, H * 0.5);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // 三个观景台位点（热区）
      SPOTS.forEach((sp, i) => {
        const x = W * SPOT_X;
        const y = H * sp.y;
        const active = i === s.spot;
        drawHold(ctx, x, y, active ? 7 : 5, active ? SC.flag : SC.hold);
        if (active) {
          ctx.strokeStyle = SC.flag;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 11, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = active ? SC.ink : SC.inkMuted;
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sp.label, x, y + 24);
        ctx.textAlign = 'left';
      });

      // 登山者：在选中位点
      const cur = SPOTS[s.spot];
      const bob = Math.sin(performance.now() / 420) * 1.5;
      drawClimber(ctx, W * SPOT_X + 26, H * cur.y + 10 + bob, { lean: -0.2 });

      // 固定 inset：特征视图（随选中位点变化）
      drawInset(ctx, INSET, { label: '该层看到的特征' });
      const fx = INSET.x + 12;
      const fy = INSET.y + 26;
      ctx.fillStyle = SC.ink;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText('感受野 ≈ ' + (cur.key === 'shallow' ? '5' : cur.key === 'mid' ? '11' : '23') + ' 像素', fx, INSET.y + 20);

      const R = 56;
      const cxp = INSET.x + INSET.w / 2;
      const cyp = INSET.y + INSET.h / 2 + 12;
      // 特征示意
      if (cur.f.style === 'lines') {
        ctx.strokeStyle = cur.f.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI;
          ctx.beginPath();
          ctx.moveTo(cxp - R * 0.7, cyp + R * 0.5 - i * 18);
          ctx.lineTo(cxp + R * 0.7, cyp + R * 0.5 - i * 18);
          ctx.stroke();
        }
      } else if (cur.f.style === 'blobs') {
        ctx.fillStyle = cur.f.color;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(cxp - R * 0.4 + i * 26, cyp - 6 + Math.sin(i * 2.1) * 10, 8 + i * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // 物体轮廓（鸟/猫）
        ctx.fillStyle = cur.f.color;
        ctx.beginPath();
        ctx.moveTo(cxp - 34, cyp + 12);
        ctx.quadraticCurveTo(cxp - 38, cyp - 22, cxp - 6, cyp - 20);
        ctx.quadraticCurveTo(cxp + 18, cyp - 34, cxp + 26, cyp - 12);
        ctx.quadraticCurveTo(cxp + 42, cyp - 14, cxp + 34, cyp + 6);
        ctx.quadraticCurveTo(cxp + 20, cyp + 22, cxp - 14, cyp + 18);
        ctx.quadraticCurveTo(cxp - 30, cyp + 18, cxp - 34, cyp + 12);
        ctx.closePath();
        ctx.fill();
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
    return () => {
      stop();
      disconnect();
    };
  }, []);

  const select = (i: number) => {
    stateRef.current.spot = i;
    setSpot(i);
    setFeedback({ text: SPOTS[i].desc, cls: SPOTS[i].cls });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row">
        {SPOTS.map((sp, i) => (
          <button
            key={sp.key}
            type="button"
            className={`chip ${i === spot ? 'selected' : ''}`}
            onClick={() => select(i)}
          >
            {sp.label}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModView;
