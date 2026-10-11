import overlay from "./website-overlay.png";
import { CoverImage } from "./cover-image";
import { Slot } from "./slot";
import { SubHeader } from "./sub-header";
import type { TemplateProps } from "./types";

/**
 * Sci&Tech Website — 1250×700
 * Change this file to restyle the wide banner.
 * Slots: image, column, header, subHeader, credit.
 */
const css = `
.sci-website {
  position: relative;
  width: 1250px;
  height: 700px;
  overflow: hidden;
  background: #07141c;
  color: #fff;
  font-family: var(--font-sans), "Kanit", sans-serif;
}
.sci-website__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000000;
}
.sci-website__credit {
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
.sci-website__column {
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
  font-size: 21px;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sci-website__copy {
  position: absolute;
  left: 90px;
  right: 90px;
  bottom: 34px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.sci-website__header {
  margin: 0;
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
.sci-website__sub {
  margin: 0;
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
.sci-website__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 1250px;
  height: 700px;
  pointer-events: none;
}
`;

export function WebsiteTemplate({
  imageUrl,
  frame,
  credit,
  column,
  header,
  subHeader,
}: TemplateProps) {
  return (
    <article className="sci-website">
      <style>{css}</style>
      <div className="sci-website__media" data-export-under-overlay>
        {imageUrl ? (
          <CoverImage src={imageUrl} width={1250} height={700} frame={frame} />
        ) : null}
      </div>
      <Slot as="p" className="sci-website__credit" aboveOverlay value={credit} />
      <Slot as="p" className="sci-website__column" aboveOverlay value={column} />
      <div className="sci-website__copy" data-export-above-overlay>
        <Slot as="h1" className="sci-website__header" value={header} />
        <SubHeader className="sci-website__sub" value={subHeader} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sci-website__overlay"
        data-export-overlay="under"
        src={overlay.src}
        alt=""
        draggable={false}
      />
    </article>
  );
}
