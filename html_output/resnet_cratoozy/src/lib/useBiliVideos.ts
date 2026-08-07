import { useEffect } from 'react';

// Bilibili metadata loader (optional). Fetches cover/title/
// duration/views at runtime via JSONP. Degrades gracefully: empty bvid => hide card;
// failed fetch => "视频暂不可用" fallback (never stuck on a loading state).
// UI strings stay in Simplified Chinese (this is webpage output, not a skill doc).

export interface BiliCard {
  bvid: string;
  title?: string;
  cover?: string;
  duration?: string;
  views?: string;
}

function formatViews(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿播放';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万播放';
  return n + '播放';
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/**
 * Fetch metadata for each bvid and call `onLoad(bvid, data)` per card.
 * Best-effort: network/Api failures are swallowed and reported as null.
 */
export function useBiliVideos(
  bvids: string[],
  onLoad: (bvid: string, data: BiliCard | null) => void
) {
  useEffect(() => {
    let cancelled = false;
    const real = bvids.filter((b) => b && b.startsWith('BV'));
    if (real.length === 0) return;

    let counter = 0;
    real.forEach((bvid) => {
      const cbName = '__bili_cb_' + ++counter + '_' + Date.now();
      const script = document.createElement('script');
      (window as unknown as Record<string, unknown>)[cbName] = (res: any) => {
        if (cancelled) return;
        delete (window as unknown as Record<string, unknown>)[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
        if (!res || res.code !== 0 || !res.data) {
          onLoad(bvid, null);
          return;
        }
        const d = res.data;
        onLoad(bvid, {
          bvid,
          title: d.title,
          cover: d.pic ? d.pic.replace(/^http:/, 'https:') : undefined,
          duration: d.duration ? formatDuration(d.duration) : undefined,
          views: d.stat ? formatViews(d.stat.view) : undefined,
        });
      };
      script.src =
        'https://api.bilibili.com/x/web-interface/view?bvid=' +
        bvid +
        '&jsonp=jsonp&callback=' +
        cbName;
      script.onerror = () => {
        if (cancelled) return;
        delete (window as unknown as Record<string, unknown>)[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
        onLoad(bvid, null);
      };
      document.body.appendChild(script);
    });

    return () => {
      cancelled = true;
    };
  }, [bvids, onLoad]);
}
