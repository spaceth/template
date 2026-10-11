import type { ComponentType } from "react";
import { AlbumTemplate } from "./album";
import { SingleTemplate } from "./single";
import type { TemplateProps } from "./types";
import { WebsiteTemplate } from "./website";

export type TemplateId = "single" | "album" | "website";

export type TemplateSpec = {
  id: TemplateId;
  name: string;
  width: number;
  height: number;
  fileName: string;
  Component: ComponentType<TemplateProps>;
};

export const templates: TemplateSpec[] = [
  {
    id: "single",
    name: "Sci&Tech Single",
    width: 1080,
    height: 1350,
    fileName: "sciandtech-single",
    Component: SingleTemplate,
  },
  {
    id: "album",
    name: "Sci&Tech Album",
    width: 1040,
    height: 1040,
    fileName: "sciandtech-album",
    Component: AlbumTemplate,
  },
  {
    id: "website",
    name: "Sci&Tech Website",
    width: 1250,
    height: 700,
    fileName: "sciandtech-website",
    Component: WebsiteTemplate,
  },
];

export function getTemplate(id: TemplateId) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
