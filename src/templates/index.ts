import type { ComponentType } from "react";
import { AlbumTemplate } from "./album";
import { SingleTemplate } from "./single";
import type { TemplateProps } from "./types";
import { WebsiteTemplate } from "./website";
import { WebsiteCleanTemplate } from "./website-clean";

export type TemplateId = "single" | "album" | "website" | "website-clean";

export type TemplateField = "credit" | "column" | "header" | "subHeader";

const allFields: TemplateField[] = ["credit", "column", "header", "subHeader"];

export type TemplateSpec = {
  id: TemplateId;
  name: string;
  width: number;
  height: number;
  fileName: string;
  fields: TemplateField[];
  Component: ComponentType<TemplateProps>;
};

export const templates: TemplateSpec[] = [
  {
    id: "single",
    name: "Sci&Tech Single",
    width: 1080,
    height: 1350,
    fileName: "sciandtech-single",
    fields: allFields,
    Component: SingleTemplate,
  },
  {
    id: "album",
    name: "Sci&Tech Album",
    width: 1040,
    height: 1040,
    fileName: "sciandtech-album",
    fields: allFields,
    Component: AlbumTemplate,
  },
  {
    id: "website",
    name: "Sci&Tech Website",
    width: 1250,
    height: 700,
    fileName: "sciandtech-website",
    fields: allFields,
    Component: WebsiteTemplate,
  },
  {
    id: "website-clean",
    name: "Sci&Tech Website Clean",
    width: 1250,
    height: 700,
    fileName: "sciandtech-website-clean",
    fields: ["credit", "column"],
    Component: WebsiteCleanTemplate,
  },
];

export function getTemplate(id: TemplateId) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
