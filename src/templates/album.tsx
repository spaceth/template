import overlay from "./album-overlay.png";
import { CoverImage } from "./cover-image";
import { Slot } from "./slot";
import type { TemplateProps } from "./types";

/**
 * Sci&Tech Album — 1040×1040
 * Same layout as Sci&Tech Single, on the square canvas.
 * Slots: image, column, header, subHeader, credit.
 */
const css = `
.sci-album {
  position: relative;
  width: 1040px;
  height: 1040px;
  overflow: hidden;
  background: #07141c;
  color: #ffffff;
  font-family: var(--font-sans), "Kanit", sans-serif;
}
.sci-album__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000000;
}
.sci-album__scrim {
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
.sci-album__credit,
.sci-album__copy {
  position: absolute;
  left: 48px;
  right: 48px;
  z-index: 1;
  text-align: left;
}
.sci-album__credit {
  top: 40px;
  margin: 0;
  color: #ffffff;
  opacity: 0.7;
  font-size: 18.7pt;
  font-weight: 300;
  line-height: 1.3;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-album__copy {
  bottom: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.sci-album__column {
  margin: 0;
  padding: 5px 15px;
  color: #ffffff;
  background: #003e9a;
  border-radius: 20px 0 0 0;
  font-size: 32.045pt;
  font-weight: 600;
  line-height: 1.2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-album__header {
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
.sci-album__sub {
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
.sci-album__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 1040px;
  height: 1040px;
  pointer-events: none;
}
`;

export function AlbumTemplate({
  imageUrl,
  frame,
  credit,
  column,
  header,
  subHeader,
}: TemplateProps) {
  return (
    <article className="sci-album">
      <style>{css}</style>
      <div className="sci-album__media">
        {imageUrl ? (
          <CoverImage src={imageUrl} width={1040} height={1040} frame={frame} />
        ) : null}
      </div>
      <div className="sci-album__scrim" />
      <Slot as="p" className="sci-album__credit" value={credit} />
      <div className="sci-album__copy">
        <Slot as="p" className="sci-album__column" value={column} />
        <Slot as="h1" className="sci-album__header" value={header} />
        <Slot as="p" className="sci-album__sub" value={subHeader} />
      </div>
      {/* Frame artwork sits above the photo and text. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sci-album__overlay"
        data-export-overlay="over"
        src={overlay.src}
        alt=""
        draggable={false}
      />
    </article>
  );
}
