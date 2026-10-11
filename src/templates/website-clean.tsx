import overlay from "./website-clean-overlay.png";
import { CoverImage } from "./cover-image";
import { Slot } from "./slot";
import type { TemplateProps } from "./types";

/**
 * Sci&Tech Website Clean — 1250×700
 * Same layout as Sci&Tech Website, with only column and credit.
 * Slots: image, column, credit.
 */
const css = `
.sci-website-clean {
  position: relative;
  width: 1250px;
  height: 700px;
  overflow: hidden;
  background: #07141c;
  color: #fff;
  font-family: var(--font-sans), "Kanit", sans-serif;
}
.sci-website-clean__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000000;
}
.sci-website-clean__credit {
  position: absolute;
  top: 35px;
  right: 90px;
  left: 90px;
  z-index: 3;
  margin: 0;
  color: #ffffff;
  opacity: 0.7;
  font-size: 13.09pt;
  font-weight: 300;
  line-height: 1.3;
  text-align: right;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-website-clean__column {
  position: absolute;
  top: 90px;
  left: 90px;
  z-index: 3;
  width: fit-content;
  max-width: calc(100% - 180px);
  margin: 0;
  padding: 5px 15px;
  color: #ffffff;
  background: #003e9a;
  border-radius: 20px 0 0 0;
  font-size: 9.614pt;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-website-clean__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 1250px;
  height: 700px;
  pointer-events: none;
}
`;

export function WebsiteCleanTemplate({ imageUrl, frame, credit, column }: TemplateProps) {
  return (
    <article className="sci-website-clean">
      <style>{css}</style>
      <div className="sci-website-clean__media" data-export-under-overlay>
        {imageUrl ? (
          <CoverImage src={imageUrl} width={1250} height={700} frame={frame} />
        ) : null}
      </div>
      <Slot as="p" className="sci-website-clean__credit" aboveOverlay value={credit} />
      <Slot as="p" className="sci-website-clean__column" aboveOverlay value={column} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sci-website-clean__overlay"
        data-export-overlay="under"
        src={overlay.src}
        alt=""
        draggable={false}
      />
    </article>
  );
}
