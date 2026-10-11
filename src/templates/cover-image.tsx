"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Box = { w: number; h: number; left: number; top: number };

export type ImageFrame = {
  zoom: number;
  focusX: number;
  focusY: number;
};

export const defaultFrame: ImageFrame = { zoom: 1, focusX: 0.5, focusY: 0.5 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampFocus(focus: number, frameSize: number, imgSize: number) {
  const half = frameSize / 2 / imgSize;
  return clamp(focus, Math.min(half, 1 - half), Math.max(half, 1 - half));
}

/** Zoom is relative to a cover fit: 1 fills the frame, 0.6 is 40% smaller. */
export function clampFrame(
  frame: ImageFrame,
  frameW: number,
  frameH: number,
  natW: number,
  natH: number,
): ImageFrame {
  const zoom = clamp(frame.zoom, 0.6, 3);
  const cover = Math.max(frameW / natW, frameH / natH) * zoom;
  const imgW = natW * cover;
  const imgH = natH * cover;
  return {
    zoom,
    focusX: clampFocus(frame.focusX, frameW, imgW),
    focusY: clampFocus(frame.focusY, frameH, imgH),
  };
}

/**
 * Crops with explicit width and position instead of object-fit.
 * The PNG export reads computed layout, and object-fit is unreliable there.
 */
export function CoverImage({
  src,
  width,
  height,
  frame = defaultFrame,
  onError,
}: {
  src: string;
  width: number;
  height: number;
  frame?: ImageFrame;
  onError?: () => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const img = ref.current;
    if (!img) return;

    const fit = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const placed = clampFrame(frame, width, height, img.naturalWidth, img.naturalHeight);
      const cover =
        Math.max(width / img.naturalWidth, height / img.naturalHeight) * placed.zoom;
      const w = img.naturalWidth * cover;
      const h = img.naturalHeight * cover;
      setBox({
        w,
        h,
        left: width / 2 - placed.focusX * w,
        top: height / 2 - placed.focusY * h,
      });
    };

    if (img.complete && img.naturalWidth) fit();
    img.addEventListener("load", fit);
    return () => img.removeEventListener("load", fit);
  }, [src, width, height, frame]);

  return (
    // Native img is required so the export captures the photo pixels.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      draggable={false}
      decoding="sync"
      onError={onError}
      style={
        box
          ? {
              position: "absolute",
              width: `${box.w}px`,
              height: `${box.h}px`,
              left: `${box.left}px`,
              top: `${box.top}px`,
              maxWidth: "none",
            }
          : {
              position: "absolute",
              inset: 0,
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: "none",
              opacity: 0,
            }
      }
    />
  );
}
