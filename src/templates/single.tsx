import overlay from "./single-overlay.png";
import { CoverImage } from "./cover-image";
import { Slot } from "./slot";
import { SubHeader } from "./sub-header";
import type { TemplateProps } from "./types";

/**
 * Sci&Tech Single — 1080×1350
 * Change this file to restyle the portrait card.
 * Slots: image, column, header, subHeader, credit.
 */
const css = `
.sci-single {
  position: relative;
  width: 1080px;
  height: 1350px;
  overflow: hidden;
  background: #07141c;
  color: #ffffff;
  font-family: var(--font-sans), "Kanit", sans-serif;
}
.sci-single__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000000;
}
.sci-single__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0) 24%,
    rgba(0, 0, 0, 0) 46%,
    rgba(0, 0, 0, 0.55) 100%
  );
}
.sci-single__copy {
  position: absolute;
  left: 70px;
  right: 70px;
  bottom: 225px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.sci-single__credit {
  margin: 8px 0 0;
  color: #ffffff;
  opacity: 0.7;
  font-size: 18.7pt;
  font-weight: 300;
  line-height: 1.3;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-single__column {
  margin: 0;
  padding: 5px 15px;
  color: #ffffff;
  background: #003e9a;
  border-radius: 20px 0 0 0;
  font-size: 20pt;
  font-weight: 600;
  line-height: 1.2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-single__header {
  margin: 8px 0 0;
  color: #ffffff;
  font-size: 65.45pt;
  font-weight: 600;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-single__sub {
  margin: 8px 0 0;
  color: #00c6ff;
  font-size: 51pt;
  font-weight: 400;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-single__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 1080px;
  height: 1350px;
  pointer-events: none;
}
`;

export function SingleTemplate({
  imageUrl,
  frame,
  credit,
  column,
  header,
  subHeader,
}: TemplateProps) {
  return (
    <article className="sci-single">
      <style>{css}</style>
      <div className="sci-single__media" data-export-under-overlay>
        {imageUrl ? (
          <CoverImage src={imageUrl} width={1080} height={1350} frame={frame} />
        ) : null}
      </div>
      <div className="sci-single__scrim" data-export-under-overlay />
      <div className="sci-single__copy" data-export-above-overlay>
        <Slot as="p" className="sci-single__column" value={column} />
        <Slot as="h1" className="sci-single__header" value={header} />
        <SubHeader className="sci-single__sub" value={subHeader} />
        <Slot as="p" className="sci-single__credit" value={credit} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sci-single__overlay"
        data-export-overlay="under"
        src={overlay.src}
        alt=""
        draggable={false}
      />
    </article>
  );
}
