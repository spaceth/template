import type { ImageFrame } from "./cover-image";

export type TemplateProps = {
  imageUrl: string | null;
  frame: ImageFrame;
  credit: string;
  column: string;
  header: string;
  subHeader: string;
};
