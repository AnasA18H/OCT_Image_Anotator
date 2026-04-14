"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../ui";
import { Maximize2, Minus, Plus } from "lucide-react";

export type OctCanvasFrame = {
  width: number;
  height: number;
  rgba?: Uint8ClampedArray;
  bitmap?: ImageBitmap;
};

export function OctCanvas({ frame }: { frame: OctCanvasFrame | null }) {
  return (
    <section
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[color:var(--color-background)] p-4"
      aria-label="Image canvas"
    >
      <div
        className="flex min-h-[min(60vh,520px)] flex-1 items-stretch justify-stretch rounded-2xl border border-[color:var(--color-ocean-green)]/20 bg-[color:var(--color-surface)] shadow-sm shadow-black/[0.03]"
      >
        {frame ? <CanvasFrame frame={frame} /> : <CanvasEmpty />}
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

function CanvasFrame({ frame }: { frame: OctCanvasFrame }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  // Default zoom: slightly zoomed-out from baseline (comfortable view).
  const DEFAULT_ZOOM = 0.6;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

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
      return;
    }

    if (!frame.rgba) return;

    const off = offscreenRef.current ?? document.createElement("canvas");
    offscreenRef.current = off;
    const imageData = new ImageData(new Uint8ClampedArray(frame.rgba), frame.width, frame.height);
    if (off.width !== frame.width) off.width = frame.width;
    if (off.height !== frame.height) off.height = frame.height;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(off, 0, 0, frame.width, frame.height, 0, 0, cssW, cssH);
  }, [cssH, cssW, dpr, frame.bitmap, frame.height, frame.rgba, frame.width]);

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
        className="rounded-xl border border-[color:var(--color-ocean-green)]/25 bg-black/5"
      />
      <p className="mt-3 font-mono text-xs text-[color:var(--color-muted)]">
        {frame.width}×{frame.height} · {(baseScale * zoom).toFixed(2)}×
      </p>
    </div>
  );
}

