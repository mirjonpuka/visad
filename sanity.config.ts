/**
 * Sanity Studio, embedded at /studio (Architecture §2, CMS schema 07).
 * Two workspaces: "Përmbajtja" (dataset production) and "Kërkesat" (private
 * dataset leads, written only by the server).
 */
import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig, defineField } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { LeadStatusBadge, MissingTranslationsBadge, ReviewTranslationsBadge } from "./sanity/badges";
import {
  apiVersion,
  dataset,
  languages,
  leadsDataset,
  projectId,
  studioContentPath,
  studioLeadsPath,
} from "./sanity/env";
import { slugify, titleInSameLanguage } from "./sanity/schemaTypes/helpers";
import { contentSchemaTypes, leadsSchemaTypes } from "./sanity/schemaTypes";
import { singletonTypes } from "./sanity/schemaTypes/documents";
import { contentStructure, leadsStructure } from "./sanity/structure";

const singletons = new Set<string>(singletonTypes);
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig([
  {
    name: "content",
    title: "Përmbajtja",
    subtitle: "visad.al",
    basePath: studioContentPath,
    projectId,
    dataset,
    plugins: [
      structureTool({ title: "Përmbajtja", structure: contentStructure }),
      presentationTool({
        title: "Parapamje",
        previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
      }),
      internationalizedArray({
        languages: [...languages],
        defaultLanguages: ["sq"],
        buttonLocations: ["field", "document"],
        languageDisplay: "codeOnly",
        fieldTypes: [
          "string",
          "text",
          "blockContent",
          defineField({
            name: "slug",
            type: "slug",
            options: { source: titleInSameLanguage, slugify, maxLength: 96 },
          }),
        ],
      }),
      colorInput(),
      visionTool({ defaultApiVersion: apiVersion, title: "GROQ" }),
    ],
    schema: {
      types: contentSchemaTypes,
      // Singletons cannot be created again; projects start from "Projekt i ri"
      templates: (templates) => [
        ...templates.filter((t) => !singletons.has(t.schemaType) && t.schemaType !== "project"),
        { id: "project-new", title: "Projekt i ri", schemaType: "project", value: { country: "Shqipëri" } },
      ],
    },
    document: {
      actions: (actions, { schemaType }) =>
        singletons.has(schemaType)
          ? actions.filter((a) => a.action && singletonActions.has(a.action))
          : actions,
      newDocumentOptions: (options, { creationContext }) =>
        creationContext.type === "global" ? options.filter((o) => !singletons.has(o.templateId)) : options,
      badges: (badges) => [...badges, MissingTranslationsBadge, ReviewTranslationsBadge],
    },
  },
  {
    name: "leads",
    title: "Kërkesat",
    subtitle: "Formularët (privat)",
    basePath: studioLeadsPath,
    projectId,
    dataset: leadsDataset,
    plugins: [structureTool({ title: "Kërkesat", structure: leadsStructure })],
    schema: {
      types: leadsSchemaTypes,
      // Leads are created only by the website forms
      templates: () => [],
    },
    document: {
      newDocumentOptions: () => [],
      actions: (actions) => actions.filter((a) => a.action !== "duplicate"),
      badges: (badges) => [...badges, LeadStatusBadge],
    },
  },
]);
