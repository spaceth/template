"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { inlineUsedFonts } from "@/lib/inline-fonts";
import { getTemplate, templates, type TemplateId } from "@/templates";
import { clampFrame, defaultFrame, type ImageFrame } from "@/templates/cover-image";
import type { TemplateProps } from "@/templates/types";

function zoomLabel(zoom: number) {
  const percent = Math.round((zoom - 1) * 100);
  return percent > 0 ? `+${percent}%` : `${percent}%`;
}

const defaultFields = {
  credit: "NASA/JPL-Caltech",
  column: "Out of This World",
  header: "หัวข้อข่าว",
  subHeader: "คำโปรยจากเนื้อหาข่าว",
};

export function Studio() {
  const [templateId, setTemplateId] = useState<TemplateId>("single");
  const [fields, setFields] = useState(defaultFields);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<ImageFrame>(defaultFrame);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    focusX: number;
    focusY: number;
    zoom: number;
  } | null>(null);

  const spec = getTemplate(templateId);
  const content: TemplateProps = { imageUrl, frame, ...fields };
  const { ref: frameRef, scale } = useFitScale(spec.width, spec.height);

  const acceptFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be used");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const probe = new Image();
      probe.onload = () => {
        setImageUrl(url);
        setNatural({ w: probe.naturalWidth, h: probe.naturalHeight });
        setFrame(defaultFrame);
        setFileName(file.name);
        setError(null);
      };
      probe.onerror = () => setError("This image could not be opened");
      probe.src = url;
    };
    reader.onerror = () => setError("This image could not be opened");
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImageUrl(null);
    setNatural(null);
    setFrame(defaultFrame);
    setFileName(null);
  }, []);

  function onPreviewPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageUrl || !natural || event.button !== 0) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some pointer events cannot be captured; dragging still tracks the move.
    }
    panRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      focusX: frame.focusX,
      focusY: frame.focusY,
      zoom: frame.zoom,
    };
    setAdjusting(true);
  }

  function onPreviewPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    if (!pan || !natural || pan.pointerId !== event.pointerId || scale <= 0) return;
    const dx = (event.clientX - pan.x) / scale;
    const dy = (event.clientY - pan.y) / scale;
    const cover = Math.max(spec.width / natural.w, spec.height / natural.h) * pan.zoom;
    setFrame(
      clampFrame(
        {
          zoom: pan.zoom,
          focusX: pan.focusX - dx / (natural.w * cover),
          focusY: pan.focusY - dy / (natural.h * cover),
        },
        spec.width,
        spec.height,
        natural.w,
        natural.h,
      ),
    );
  }

  function endPreviewPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (panRef.current?.pointerId !== event.pointerId) return;
    panRef.current = null;
    setAdjusting(false);
  }

  useEffect(() => {
    let depth = 0;
    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes("Files");

    const onEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setDragOver(true);
    };
    const onOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
    };
    const onLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragOver(false);
    };
    const onDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragOver(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) acceptFile(file);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [acceptFile]);

  async function download() {
    const article = exportRef.current?.querySelector("article");
    if (!article) return;
    setDownloading(true);
    setError(null);
    try {
      await document.fonts.ready;
      const images = [...article.querySelectorAll("img")];
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
                return;
              }
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );
      await waitForCover(article);
      const fontEmbedCSS = await inlineUsedFonts(article);
      const canvas = await renderCard(article, {
        width: spec.width,
        height: spec.height,
        canvasWidth: spec.width,
        canvasHeight: spec.height,
        pixelRatio: 1,
        cacheBust: false,
        skipAutoScale: true,
        fontEmbedCSS,
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (!blob) throw new Error("empty image");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${spec.fileName}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setError("Could not create the image. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  const Active = spec.Component;

  return (
    <div className="studio">
      <header className="studio__top">
        <div className="studio__brand">
          <span className="studio__mark" />
          <div>
            <p className="studio__kicker">Thai PBS Sci & Tech</p>
            <h1 className="studio__title">Image templates</h1>
          </div>
        </div>
      </header>

      <div className="studio__picker" role="radiogroup" aria-label="Choose a template">
        {templates.map((template) => {
          const selected = template.id === spec.id;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? "picker is-selected" : "picker"}
              onClick={() => setTemplateId(template.id)}
            >
              <span
                className="picker__ratio"
                style={{ aspectRatio: `${template.width} / ${template.height}` }}
              />
              <span className="picker__text">
                <span className="picker__name">{template.name}</span>
                <span className="picker__size">
                  {template.width} × {template.height}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="studio__body">
        <section className="studio__form" aria-label="Card content">
          <div className="field">
            <div className="field__label">
              <span>Photo</span>
            </div>
            <label className="dropzone">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) acceptFile(file);
                }}
              />
              {imageUrl ? (
                <span className="dropzone__filled">
                  {/* Thumbnail only, not part of the exported card. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" />
                  <span>
                    <strong>{fileName}</strong>
                    <span>Click or drop a new photo to replace</span>
                  </span>
                </span>
              ) : (
                <span className="dropzone__empty">
                  <strong>Drag a photo here, or click to choose a file</strong>
                  <span>PNG, JPG, WEBP</span>
                </span>
              )}
            </label>
            {imageUrl ? (
              <button type="button" className="text-button" onClick={clearImage}>
                Remove photo
              </button>
            ) : null}
            {imageUrl && natural ? (
              <div className="frame-controls">
                <label className="field__label" htmlFor="zoom">
                  <span>Zoom</span>
                  <span className="field__hint">{zoomLabel(frame.zoom)}</span>
                </label>
                <input
                  id="zoom"
                  type="range"
                  min={-40}
                  max={200}
                  step={1}
                  value={Math.round((frame.zoom - 1) * 100)}
                  aria-valuetext={zoomLabel(frame.zoom)}
                  onChange={(event) => {
                    const zoom = 1 + Number(event.target.value) / 100;
                    setFrame((current) =>
                      clampFrame(
                        { ...current, zoom },
                        spec.width,
                        spec.height,
                        natural.w,
                        natural.h,
                      ),
                    );
                  }}
                />
                <p className="studio__note">Drag the preview to move the photo</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setFrame(defaultFrame)}
                >
                  Reset framing
                </button>
              </div>
            ) : null}
          </div>

          {spec.fields.includes("credit") ? (
            <Field
              label="Credit"
              hint="Photo credit"
              value={fields.credit}
              placeholder="e.g. NASA/JPL-Caltech"
              onChange={(credit) => setFields((current) => ({ ...current, credit }))}
            />
          ) : null}
          {spec.fields.includes("column") ? (
            <Field
              label="Column"
              hint="Category"
              value={fields.column}
              placeholder="e.g. Science"
              onChange={(column) => setFields((current) => ({ ...current, column }))}
            />
          ) : null}
          {spec.fields.includes("header") ? (
            <Field
              label="Header"
              hint="Headline"
              value={fields.header}
              placeholder="Main headline on the image"
              multiline
              onChange={(header) => setFields((current) => ({ ...current, header }))}
            />
          ) : null}
          {spec.fields.includes("subHeader") ? (
            <Field
              label="Sub-Header"
              hint="Standfirst"
              value={fields.subHeader}
              placeholder="Short standfirst"
              multiline
              onChange={(subHeader) => setFields((current) => ({ ...current, subHeader }))}
            />
          ) : null}

          {error ? (
            <p className="studio__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="download"
            onClick={download}
            disabled={downloading}
          >
            {downloading ? "Creating image..." : "Download PNG"}
          </button>
          <p className="studio__note">
            Downloads a {spec.width} × {spec.height} pixel PNG of the selected template
          </p>
        </section>

        <section className="studio__stage" aria-label="Preview">
          <div className="studio__stage-frame" ref={frameRef}>
            <div
              className={
                imageUrl
                  ? adjusting
                    ? "preview-shadow is-adjustable is-adjusting"
                    : "preview-shadow is-adjustable"
                  : "preview-shadow"
              }
              style={{ width: spec.width * scale, height: spec.height * scale }}
              onPointerDown={onPreviewPointerDown}
              onPointerMove={onPreviewPointerMove}
              onPointerUp={endPreviewPan}
              onPointerCancel={endPreviewPan}
            >
              <div
                style={{
                  width: spec.width,
                  height: spec.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <Active {...content} />
              </div>
            </div>
          </div>
          <p className="studio__stage-meta">
            {spec.name} · {spec.width} × {spec.height}
          </p>
        </section>
      </div>

      <div
        ref={exportRef}
        aria-hidden
        className="export-root"
      >
        <Active {...content} />
      </div>

      {dragOver ? (
        <div className="drag-overlay">
          <p>Drop a photo to use it on the template</p>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  placeholder,
  multiline,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        <span>{label}</span>
        <span className="field__hint">{hint}</span>
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={label === "Header" ? 3 : 2}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

type CaptureOptions = {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  pixelRatio: number;
  cacheBust: boolean;
  skipAutoScale: boolean;
  fontEmbedCSS: string;
};

function isOverlayNode(node: Node) {
  return node instanceof HTMLImageElement && node.dataset.exportOverlay != null;
}

async function renderCard(article: HTMLElement, options: CaptureOptions) {
  const { toCanvas } = await import("html-to-image");
  const overlays = [...article.querySelectorAll<HTMLImageElement>("img[data-export-overlay]")];
  const under = overlays.filter((img) => img.dataset.exportOverlay === "under");
  const over = overlays.filter((img) => img.dataset.exportOverlay === "over");
  const hidden: Array<[HTMLElement, string]> = [];

  const hide = (element: HTMLElement) => {
    hidden.push([element, element.style.visibility]);
    element.style.visibility = "hidden";
  };
  const restore = () => {
    for (const [element, visibility] of hidden) element.style.visibility = visibility;
    hidden.length = 0;
  };

  const capture = (extra?: {
    backgroundColor?: string;
    style?: Partial<CSSStyleDeclaration>;
  }) =>
    toCanvas(article, {
      ...options,
      ...extra,
      filter: (node: HTMLElement) => !isOverlayNode(node),
    });

  try {
    if (under.length) {
      article.querySelectorAll<HTMLElement>("[data-export-above-overlay]").forEach(hide);
    }
    const canvas = await capture();
    restore();

    const context = canvas.getContext("2d");
    if (!context) throw new Error("empty image");
    for (const img of under) {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    if (under.length) {
      article.querySelectorAll<HTMLElement>("[data-export-under-overlay]").forEach(hide);
      const previousBackground = article.style.background;
      const previousBackgroundColor = article.style.backgroundColor;
      article.style.background = "transparent";
      article.style.backgroundColor = "transparent";
      try {
        const text = await capture({
          backgroundColor: "transparent",
          style: { background: "transparent", backgroundColor: "transparent" },
        });
        context.drawImage(text, 0, 0);
      } finally {
        article.style.background = previousBackground;
        article.style.backgroundColor = previousBackgroundColor;
        restore();
      }
    }

    for (const img of over) {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
  } finally {
    restore();
  }
}

function useFitScale(width: number, height: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const style = getComputedStyle(el);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availW = Math.max(el.clientWidth - padX, 1);
      const availH = Math.max(el.clientHeight - padY, 1);
      setScale(Math.min(1, availW / width, availH / height));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  return { ref, scale };
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForCover(article: HTMLElement) {
  const start = performance.now();
  while (performance.now() - start < 2500) {
    const img = article.querySelector("img");
    if (!img || img.style.left) return;
    await nextFrame();
  }
}
