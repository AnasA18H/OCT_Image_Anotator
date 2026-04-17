"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../ui";
import { Maximize2, Minus, Plus } from "lucide-react";

export type OctCanvasFrame = {
  width: number;
  height: number;
  rgba?: Uint8ClampedArray;
  bitmap?: ImageBitmap;
};

/** One marker in original image pixel space (not zoomed canvas pixels). */
export type ImagePoint = { x: number; y: number };

export type DrawMode = "point" | "polygon" | "line" | "freehand";

export type Annotation =
  | { id: string; type: "point"; points: [ImagePoint] }
  | { id: string; type: "line"; points: [ImagePoint, ImagePoint] }
  | { id: string; type: "polygon"; points: ImagePoint[]; closed: true }
  /** Phase 5: polyline in image pixels (≥2 points). */
  | { id: string; type: "freehand"; points: ImagePoint[] };

export type Draft =
  | { type: "polygon"; points: ImagePoint[] }
  | { type: "line"; points: [ImagePoint] };

export function OctCanvas({
  frame,
  annotations,
  mode,
  draft,
  onClickImage,
  onDoubleClickImage,
  onFreehandComplete,
  onNavigateSlice,
}: {
  frame: OctCanvasFrame | null;
  /** Current slice only — parent keeps per-slice maps. */
  annotations: Annotation[];
  mode: DrawMode;
  draft: Draft | null;
  onClickImage?: (p: ImagePoint) => void;
  onDoubleClickImage?: (p: ImagePoint) => void;
  /** Phase 5: released after drag; points in image space. */
  onFreehandComplete?: (points: ImagePoint[]) => void;
  /** Touch gesture: two-finger swipe left/right to change slice. */
  onNavigateSlice?: (delta: -1 | 1) => void;
}) {
  return (
    <section
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[color:var(--color-background)] p-4"
      aria-label="Image canvas"
    >
      <div
        className="flex min-h-[min(60vh,520px)] flex-1 items-stretch justify-stretch rounded-2xl border border-[color:var(--color-ocean-green)]/20 bg-[color:var(--color-surface)] shadow-sm shadow-black/[0.03]"
      >
        {frame ? (
          <CanvasFrame
            frame={frame}
            annotations={annotations}
            mode={mode}
            draft={draft}
            onClickImage={onClickImage}
            onDoubleClickImage={onDoubleClickImage}
            onFreehandComplete={onFreehandComplete}
            onNavigateSlice={onNavigateSlice}
          />
        ) : (
          <CanvasEmpty />
        )}
      </div>
    </section>
  );
}

function CanvasEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="h-10 w-10 rounded-2xl border border-[color:var(--color-ocean-green)]/30 bg-[color:var(--color-surface-2)]" />
      <p className="text-sm font-medium text-[color:var(--color-foreground)]">Canvas</p>
      <p className="text-sm text-[color:var(--color-muted)]">
        Pick a local image/TIFF to display the first slice.
      </p>
    </div>
  );
}

function CanvasFrame({
  frame,
  annotations,
  mode,
  draft,
  onClickImage,
  onDoubleClickImage,
  onFreehandComplete,
  onNavigateSlice,
}: {
  frame: OctCanvasFrame;
  annotations: Annotation[];
  mode: DrawMode;
  draft: Draft | null;
  onClickImage?: (p: ImagePoint) => void;
  onDoubleClickImage?: (p: ImagePoint) => void;
  onFreehandComplete?: (points: ImagePoint[]) => void;
  onNavigateSlice?: (delta: -1 | 1) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  // Default zoom: slightly zoomed-out from baseline (comfortable view).
  const DEFAULT_ZOOM = 0.6;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [hoverImage, setHoverImage] = useState<ImagePoint | null>(null);
  /** In-progress freehand stroke (image space); committed on pointer up. */
  const [freehandLive, setFreehandLive] = useState<ImagePoint[] | null>(null);
  const suppressNextClickRef = useRef(false);
  const freehandPointerIdRef = useRef<number | null>(null);
  /** Latest stroke samples (synced with freehandLive for paint). */
  const freehandStrokeRef = useRef<ImagePoint[]>([]);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Touch gesture state (pinch zoom + 2-finger swipe to change slice).
  const touchRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    startMidX: number;
    lastNavAt: number;
  }>({ active: false, startDist: 0, startZoom: DEFAULT_ZOOM, startMidX: 0, lastNavAt: 0 });

  function clampZoom(z: number) {
    return Math.max(0.2, Math.min(6, Math.round(z * 100) / 100));
  }

  // Trackpad gestures: pinch-to-zoom typically comes through as ctrlKey+wheel.
  // Two-finger horizontal scroll comes through as wheel with deltaX.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomRef = { current: DEFAULT_ZOOM };
    const setZoomSmooth = (next: number) => setZoom(next);

    const wheelState = {
      raf: 0 as number | 0,
      pendingZoomDelta: 0,
      pendingSliceDeltaX: 0,
      lastSliceAt: 0,
    };

    const applyPending = () => {
      wheelState.raf = 0;

      // Apply pinch zoom (accumulated).
      if (wheelState.pendingZoomDelta !== 0) {
        const step = 0.0016; // slightly gentler than before for smoothness
        const dz = wheelState.pendingZoomDelta;
        wheelState.pendingZoomDelta = 0;
        const next = clampZoom(zoomRef.current * Math.exp(-dz * step));
        zoomRef.current = next;
        setZoomSmooth(next);
      }

      // Apply slice navigation from horizontal scroll.
      if (wheelState.pendingSliceDeltaX !== 0 && onNavigateSlice) {
        const dx = wheelState.pendingSliceDeltaX;
        // keep remainder so slow scroll still works smoothly
        const threshold = 55;
        const now = Date.now();
        const cooldownMs = 120;
        if (now - wheelState.lastSliceAt >= cooldownMs) {
          if (dx >= threshold) {
            wheelState.pendingSliceDeltaX = dx - threshold;
            wheelState.lastSliceAt = now;
            onNavigateSlice(1);
          } else if (dx <= -threshold) {
            wheelState.pendingSliceDeltaX = dx + threshold;
            wheelState.lastSliceAt = now;
            onNavigateSlice(-1);
          }
        }
        // If we still have enough delta left, schedule another frame.
        if (Math.abs(wheelState.pendingSliceDeltaX) >= threshold && wheelState.raf === 0) {
          wheelState.raf = requestAnimationFrame(applyPending);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Only handle if the pointer is over the canvas.
      // We prevent default to avoid page scroll/zoom while interacting with the image.
      const wantsPinchZoom = e.ctrlKey;
      const wantsSliceScroll = !e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2;

      if (!wantsPinchZoom && !wantsSliceScroll) return;
      e.preventDefault();

      if (wantsPinchZoom) {
        // ctrlKey+wheel: negative deltaY usually means zoom in.
        wheelState.pendingZoomDelta += e.deltaY;
        if (wheelState.raf === 0) wheelState.raf = requestAnimationFrame(applyPending);
      } else if (wantsSliceScroll && onNavigateSlice) {
        wheelState.pendingSliceDeltaX += e.deltaX;
        if (wheelState.raf === 0) wheelState.raf = requestAnimationFrame(applyPending);
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel as EventListener);
      if (wheelState.raf) cancelAnimationFrame(wheelState.raf);
    };
  }, [onNavigateSlice]);

  useEffect(() => {
    if (mode === "freehand") return;
    const id = requestAnimationFrame(() => {
      setFreehandLive(null);
      freehandStrokeRef.current = [];
      freehandPointerIdRef.current = null;
    });
    return () => cancelAnimationFrame(id);
  }, [mode]);

  useEffect(() => {
    if (mode !== "freehand") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!freehandLive || freehandLive.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      freehandStrokeRef.current = [];
      setFreehandLive(null);
      suppressNextClickRef.current = true;
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [freehandLive, mode]);

  // Base scale: keep 1:1 unless the slice is huge.
  const baseMaxW = 1100;
  const baseMaxH = 650;
  const baseScale = useMemo(() => {
    return Math.min(baseMaxW / frame.width, baseMaxH / frame.height, 1);
  }, [frame.height, frame.width]);

  const { cssW, cssH } = useMemo(() => {
    const scale = baseScale * zoom;
    return {
      cssW: Math.round(frame.width * scale),
      cssH: Math.round(frame.height * scale),
    };
  }, [baseScale, frame.height, frame.width, zoom]);

  const clientToImage = useCallback(
    (clientX: number, clientY: number): ImagePoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const ox = clientX - rect.left;
      const oy = clientY - rect.top;
      if (ox < 0 || oy < 0 || ox > cssW || oy > cssH) return null;
      const x = (ox / cssW) * frame.width;
      const y = (oy / cssH) * frame.height;
      return {
        x: Math.max(0, Math.min(frame.width - Number.EPSILON, x)),
        y: Math.max(0, Math.min(frame.height - Number.EPSILON, y)),
      };
    },
    [cssH, cssW, frame.height, frame.width],
  );

  const seaFill = "rgba(46, 139, 87, 0.35)";
  const seaStroke = "rgb(35, 104, 65)";

  const drawPoint = useCallback(
    (ctx: CanvasRenderingContext2D, p: ImagePoint) => {
      const px = (p.x / frame.width) * cssW;
      const py = (p.y / frame.height) * cssH;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = seaFill;
      ctx.strokeStyle = seaStroke;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    },
    [cssH, cssW, frame.height, frame.width, seaFill, seaStroke],
  );

  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, a: ImagePoint, b: ImagePoint, dashed = false) => {
      const ax = (a.x / frame.width) * cssW;
      const ay = (a.y / frame.height) * cssH;
      const bx = (b.x / frame.width) * cssW;
      const by = (b.y / frame.height) * cssH;
      ctx.save();
      ctx.strokeStyle = seaStroke;
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.restore();
    },
    [cssH, cssW, frame.height, frame.width, seaStroke],
  );

  const drawPolygon = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      pts: ImagePoint[],
      opts: { closed: boolean; fill: boolean; dashed: boolean },
    ) => {
      if (pts.length === 0) return;
      ctx.save();
      ctx.strokeStyle = seaStroke;
      ctx.lineWidth = 2;
      if (opts.dashed) ctx.setLineDash([6, 6]);
      ctx.beginPath();
      const first = pts[0]!;
      ctx.moveTo((first.x / frame.width) * cssW, (first.y / frame.height) * cssH);
      for (const p of pts.slice(1)) {
        ctx.lineTo((p.x / frame.width) * cssW, (p.y / frame.height) * cssH);
      }
      if (opts.closed) ctx.closePath();
      if (opts.fill && opts.closed) {
        ctx.fillStyle = "rgba(46, 139, 87, 0.18)";
        ctx.fill();
      }
      ctx.stroke();
      ctx.restore();
    },
    [cssH, cssW, frame.height, frame.width, seaStroke],
  );

  /** Freehand stroke: open polyline with rounded caps (Phase 5). */
  const drawFreehandPolyline = useCallback(
    (ctx: CanvasRenderingContext2D, pts: ImagePoint[]) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = seaStroke;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const first = pts[0]!;
      ctx.moveTo((first.x / frame.width) * cssW, (first.y / frame.height) * cssH);
      for (const p of pts.slice(1)) {
        ctx.lineTo((p.x / frame.width) * cssW, (p.y / frame.height) * cssH);
      }
      ctx.stroke();
      ctx.restore();
    },
    [cssH, cssW, frame.height, frame.width, seaStroke],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.imageSmoothingEnabled = false;
    if (frame.bitmap) {
      ctx.drawImage(frame.bitmap, 0, 0, frame.width, frame.height, 0, 0, cssW, cssH);
    } else if (frame.rgba) {
      const off = offscreenRef.current ?? document.createElement("canvas");
      offscreenRef.current = off;
      const imageData = new ImageData(new Uint8ClampedArray(frame.rgba), frame.width, frame.height);
      if (off.width !== frame.width) off.width = frame.width;
      if (off.height !== frame.height) off.height = frame.height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(off, 0, 0, frame.width, frame.height, 0, 0, cssW, cssH);
    }

    // Final annotations.
    for (const a of annotations) {
      if (a.type === "point") {
        drawPoint(ctx, a.points[0]);
      } else if (a.type === "line") {
        drawLine(ctx, a.points[0], a.points[1]);
        drawPoint(ctx, a.points[0]);
        drawPoint(ctx, a.points[1]);
      } else if (a.type === "polygon") {
        drawPolygon(ctx, a.points, { closed: true, fill: true, dashed: false });
        for (const p of a.points) drawPoint(ctx, p);
      } else if (a.type === "freehand") {
        drawFreehandPolyline(ctx, a.points);
      }
    }

    // Draft preview (uses current hover as dynamic endpoint).
    if (draft && hoverImage) {
      if (draft.type === "polygon" && draft.points.length > 0) {
        drawPolygon(ctx, [...draft.points, hoverImage], { closed: false, fill: false, dashed: true });
        for (const p of draft.points) drawPoint(ctx, p);
      } else if (draft.type === "line") {
        drawLine(ctx, draft.points[0], hoverImage, true);
        drawPoint(ctx, draft.points[0]);
      }
    } else if (draft && draft.type === "polygon") {
      // No hover (e.g. pointer left) — still show existing draft points.
      if (draft.points.length > 1) {
        drawPolygon(ctx, draft.points, { closed: false, fill: false, dashed: true });
      }
      for (const p of draft.points) drawPoint(ctx, p);
    } else if (draft && draft.type === "line") {
      drawPoint(ctx, draft.points[0]);
    }

    if (freehandLive && freehandLive.length >= 2) {
      drawFreehandPolyline(ctx, freehandLive);
    }
  }, [
    annotations,
    cssH,
    cssW,
    dpr,
    draft,
    drawFreehandPolyline,
    drawLine,
    drawPoint,
    drawPolygon,
    frame.bitmap,
    freehandLive,
    frame.height,
    frame.rgba,
    frame.width,
    hoverImage,
  ]);

  return (
    <div
      className="relative flex w-full flex-col items-center justify-center p-6"
    >
      {/* Floating canvas toolbar (left) */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-2xl border border-[color:var(--color-ocean-green)]/25 bg-[color:var(--color-surface)]/95 p-1 shadow-lg shadow-black/5 backdrop-blur">
        <IconButton
          tone="accent"
          label="Zoom in"
          onClick={() => setZoom((z) => Math.min(6, Math.round((z + 0.1) * 10) / 10))}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.2, Math.round((z - 0.1) * 10) / 10))}
        >
          <Minus className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Default size"
          onClick={() => setZoom(DEFAULT_ZOOM)}
        >
          <Maximize2 className="h-5 w-5" aria-hidden="true" />
        </IconButton>
      </div>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label="OCT slice canvas"
        className="cursor-crosshair rounded-xl border border-[color:var(--color-ocean-green)]/25 bg-black/5"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => {
          const p = clientToImage(e.clientX, e.clientY);
          setHoverImage(p);
          if (mode !== "freehand") return;
          if (freehandPointerIdRef.current !== e.pointerId) return;
          if ((e.buttons & 1) === 0) return;
          if (!p) return;
          const prev = freehandStrokeRef.current;
          const last = prev[prev.length - 1];
          if (last) {
            const dx = p.x - last.x;
            const dy = p.y - last.y;
            if (dx * dx + dy * dy < 0.72 * 0.72) return;
          }
          const next = [...prev, p];
          freehandStrokeRef.current = next;
          setFreehandLive(next);
        }}
        onPointerLeave={() => setHoverImage(null)}
        onPointerDown={(e) => {
          if (mode !== "freehand" || e.button !== 0) return;
          const p = clientToImage(e.clientX, e.clientY);
          if (!p) return;
          e.preventDefault();
          suppressNextClickRef.current = true;
          freehandPointerIdRef.current = e.pointerId;
          freehandStrokeRef.current = [p];
          setFreehandLive([p]);
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (mode !== "freehand") return;
          if (freehandPointerIdRef.current !== e.pointerId) return;
          freehandPointerIdRef.current = null;
          const el = e.currentTarget as HTMLCanvasElement;
          try {
            el.releasePointerCapture(e.pointerId);
          } catch {
            /* already released */
          }
          const pts = freehandStrokeRef.current;
          freehandStrokeRef.current = [];
          setFreehandLive(null);
          if (pts.length >= 2 && onFreehandComplete) onFreehandComplete(pts);
        }}
        onPointerCancel={(e) => {
          if (mode !== "freehand") return;
          if (freehandPointerIdRef.current !== e.pointerId) return;
          freehandPointerIdRef.current = null;
          freehandStrokeRef.current = [];
          setFreehandLive(null);
          suppressNextClickRef.current = true;
        }}
        onClick={(e) => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          if (mode === "freehand") return;
          if (!onClickImage) return;
          const p = clientToImage(e.clientX, e.clientY);
          if (p) onClickImage(p);
        }}
        onDoubleClick={(e) => {
          if (mode === "freehand") return;
          if (!onDoubleClickImage) return;
          const p = clientToImage(e.clientX, e.clientY);
          if (p) onDoubleClickImage(p);
        }}
        onTouchStart={(e) => {
          if (e.touches.length !== 2) return;
          e.preventDefault();
          const t1 = e.touches[0]!;
          const t2 = e.touches[1]!;
          const dx = t2.clientX - t1.clientX;
          const dy = t2.clientY - t1.clientY;
          const dist = Math.hypot(dx, dy);
          const midX = (t1.clientX + t2.clientX) / 2;
          touchRef.current = {
            active: true,
            startDist: dist,
            startZoom: zoom,
            startMidX: midX,
            lastNavAt: touchRef.current.lastNavAt,
          };
        }}
        onTouchMove={(e) => {
          if (e.touches.length !== 2) return;
          if (!touchRef.current.active) return;
          e.preventDefault();
          const t1 = e.touches[0]!;
          const t2 = e.touches[1]!;
          const dx = t2.clientX - t1.clientX;
          const dy = t2.clientY - t1.clientY;
          const dist = Math.hypot(dx, dy);
          const midX = (t1.clientX + t2.clientX) / 2;

          // Pinch zoom.
          if (touchRef.current.startDist > 0) {
            const ratio = dist / touchRef.current.startDist;
            setZoom(clampZoom(touchRef.current.startZoom * ratio));
          }

          // Two-finger horizontal swipe to change slice.
          if (onNavigateSlice) {
            const now = Date.now();
            const cooldownMs = 250;
            const dxMid = midX - touchRef.current.startMidX;
            const threshold = 50;
            if (now - touchRef.current.lastNavAt > cooldownMs) {
              if (dxMid > threshold) {
                touchRef.current.lastNavAt = now;
                touchRef.current.startMidX = midX;
                onNavigateSlice(-1);
              } else if (dxMid < -threshold) {
                touchRef.current.lastNavAt = now;
                touchRef.current.startMidX = midX;
                onNavigateSlice(1);
              }
            }
          }
        }}
        onTouchEnd={() => {
          touchRef.current.active = false;
        }}
      />
      <p className="mt-3 font-mono text-xs text-[color:var(--color-muted)]">
        {frame.width}×{frame.height} · {(baseScale * zoom).toFixed(2)}×
        {hoverImage ? (
          <>
            {" "}
            · x:{Math.round(hoverImage.x)} y:{Math.round(hoverImage.y)}
          </>
        ) : (
          <>
            {" "}
            · x:— y:—
          </>
        )}
        {" "}
        · mode:{mode}
      </p>
    </div>
  );
}

