import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawRope, drawSceneLabel } from './climbKit';

// §8 M8.1 架构热区 —— P5 点击热区（6 个组件）+ 固定信息区
// 论文 Table 1（ResNet-34）+ Fig.3（right）。

const W = 560;
const H = 250;

const NODES = [
  {
    key: 'conv1',
    x: 0.13,
    label: 'conv1',
    info: '7×7 卷积（stride 2）：224×224×3 → 112×112×64。提取底层边缘特征。',
  },
  {
    key: 'conv2',
    x: 0.31,
    label: 'conv2_x',
    info: '3 个残差块：56×56×64。全为恒等捷径（实线），特征图尺寸不变。',
  },
  {
    key: 'conv3',
    x: 0.49,
    label: 'conv3_x',
    info: '4 个残差块：28×28×128。第一个块用投影捷径（虚线）：通道翻倍、尺寸减半。',
  },
  {
    key: 'conv4',
    x: 0.67,
    label: 'conv4_x',
    info: '6 个残差块：14×14×256。第一个块用投影捷径。',
  },
  {
    key: 'conv5',
    x: 0.85,
    label: 'conv5_x',
    info: '3 个残差块：7×7×512。之后接全局平均池化。',
  },
];

const HEAD = { x: 0.95, label: 'head' };

export const ModArch: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ sel: 0 });
  const rafRef = useRef<number | null>(null);
  const [sel, setSel] = useState(0);
  const [feedback, setFeedback] = useState({
    text: NODES[0].info + '（head：7×7×512 → 全局平均池化 → 1000 类全连接 + softmax）',
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

    const cy = 84;

    const render = (s: { sel: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);
      // 输入节点
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = SC.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(18, cy - 24, 44, 48, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('输入', 40, cy + 3);
      ctx.fillStyle = SC.inkMuted;
      ctx.font = '9px "Segoe UI", sans-serif';
      ctx.fillText('224²×3', 40, cy + 16);

      // 主干连接（虚线代表投影捷径）
      const xs = [0.13, 0.31, 0.49, 0.67, 0.85].map((v) => W * v);
      for (let i = 0; i < xs.length; i++) {
        const from = i === 0 ? 62 : xs[i - 1] + 26;
        const to = xs[i] - 26;
        const isProj = i === 2 || i === 3 || i === 4;
        drawRope(ctx, from, cy, to, cy, i <= s.sel ? SC.climber : SC.line, isProj, 0);
      }
      // head 连接
      drawRope(ctx, xs[4] + 26, cy, W * HEAD.x - 26, cy, SC.line, false, 0);

      // 节点绘制
      NODES.forEach((n, i) => {
        const x = W * n.x;
        const active = i === s.sel;
        const isProjNode = i === 2 || i === 3 || i === 4;
        ctx.fillStyle = active ? SC.climber : '#fff';
        ctx.strokeStyle = active ? SC.climber : isProjNode ? SC.flag : SC.line;
        ctx.lineWidth = active ? 3 : 1.5;
        ctx.setLineDash(active ? [] : isProjNode ? [4, 3] : []);
        ctx.beginPath();
        ctx.roundRect(x - 26, cy - 26, 52, 52, 8);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = active ? '#fff' : SC.ink;
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, x, cy - 4);
        const dims = ['56²×64', '56²×64', '28²×128', '14²×256', '7²×512'][i];
        ctx.fillStyle = active ? 'rgba(255,255,255,0.9)' : SC.inkMuted;
        ctx.font = '9px "Segoe UI", sans-serif';
        ctx.fillText(dims, x, cy + 12);
        ctx.textAlign = 'left';
        if (active) {
          ctx.strokeStyle = SC.flag;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, cy - 34, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // head 节点
      const hx = W * HEAD.x;
      const active = s.sel === 5;
      ctx.fillStyle = active ? SC.flag : '#fff';
      ctx.strokeStyle = active ? SC.flag : SC.line;
      ctx.lineWidth = active ? 3 : 1.5;
      ctx.beginPath();
      ctx.roundRect(hx - 22, cy - 26, 44, 52, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = active ? '#fff' : SC.ink;
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('head', hx, cy + 2);
      ctx.fillStyle = active ? 'rgba(255,255,255,0.9)' : SC.inkMuted;
      ctx.font = '9px "Segoe UI", sans-serif';
      ctx.fillText('1000 类', hx, cy + 16);
      ctx.textAlign = 'left';

      // 信息区（固定）
      const cur = s.sel === 5 ? null : NODES[s.sel];
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = SC.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 140, W - 40, 84, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = SC.inkMuted;
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillText('📋 组件信息', 32, 162);
      ctx.fillStyle = SC.ink;
      ctx.font = '12px "Segoe UI", sans-serif';
      if (cur) {
        ctx.fillText(cur.label, 32, 182);
        // 换行简单处理：信息文本可能较长
        const t = cur.info;
        ctx.fillStyle = SC.inkMuted;
        const line1 = t.slice(0, Math.min(t.length, 30));
        const line2 = t.length > 30 ? t.slice(30) : '';
        ctx.fillText(line1, 32, 200);
        if (line2) ctx.fillText(line2, 32, 216);
      } else {
        ctx.fillText('head', 32, 182);
        ctx.fillStyle = SC.inkMuted;
        ctx.fillText('7×7×512 → 全局平均池化 → 1000 类全连接 + softmax，输出分类概率。', 32, 200);
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

    // 点击热区
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = W / rect.width;
      const px = (e.clientX - rect.left) * scale;
      const py = (e.clientY - rect.top) * scale;
      if (py < cy - 40 || py > cy + 40) return;
      let found = -1;
      for (let i = 0; i < NODES.length; i++) {
        if (Math.abs(px - W * NODES[i].x) < 34) {
          found = i;
          break;
        }
      }
      if (found === -1 && Math.abs(px - W * HEAD.x) < 30) found = 5;
      if (found >= 0) {
        stateRef.current.sel = found;
        setSel(found);
        if (found === 5) {
          setFeedback({ text: 'head：7×7×512 → 全局平均池化 → 1000 类全连接 + softmax，输出分类概率。', cls: 'good' });
        } else {
          setFeedback({ text: NODES[found].info, cls: 'good' });
        }
      }
    };
    canvas.addEventListener('click', onClick);
    return () => {
      stop();
      disconnect();
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} style={{ cursor: 'pointer' }} />
      <div className="chip-row">
        {NODES.map((n, i) => (
          <button
            key={n.key}
            type="button"
            className={`chip ${i === sel ? 'selected' : ''}`}
            onClick={() => {
              stateRef.current.sel = i;
              setSel(i);
              setFeedback({ text: n.info, cls: 'good' });
            }}
          >
            {n.label}
          </button>
        ))}
        <button
          type="button"
          className={`chip ${sel === 5 ? 'selected' : ''}`}
          onClick={() => {
            stateRef.current.sel = 5;
            setSel(5);
            setFeedback({ text: 'head：7×7×512 → 全局平均池化 → 1000 类全连接 + softmax，输出分类概率。', cls: 'good' });
          }}
        >
          head
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModArch;
