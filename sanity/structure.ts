import { icon } from "./icons";
import type { StructureResolver } from "sanity/structure";

/** Content workspace: "Projektet" first, then collections, then singletons (Architecture §2). */
export const contentStructure: StructureResolver = (S) =>
  S.list()
    .title("Përmbajtja")
    .items([
      S.documentTypeListItem("project").title("Projektet"),
      S.divider(),
      S.listItem()
        .title("Sistemet")
        .schemaType("system")
        .child(
          S.documentTypeList("system")
            .title("Sistemet")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.documentTypeListItem("systemSeries").title("Seritë ALUMIL"),
      S.documentTypeListItem("finish").title("Ngjyrat & përfundimet"),
      S.documentTypeListItem("solution").title("Zgjidhjet"),
      S.documentTypeListItem("download").title("Shkarkimet"),
      S.documentTypeListItem("certificate").title("Certifikatat"),
      S.documentTypeListItem("job").title("Pozicionet e punës"),
      S.documentTypeListItem("legalPage").title("Faqet ligjore"),
      S.divider(),
      S.listItem()
        .title("Kryefaqja")
        .icon(icon("home"))
        .child(S.document().schemaType("homePage").documentId("homePage").title("Kryefaqja")),
      S.listItem()
        .title("Faqja e fabrikës")
        .icon(icon("block-element"))
        .child(S.document().schemaType("factoryPage").documentId("factoryPage").title("Faqja e fabrikës")),
      S.listItem()
        .title("Faqet e tjera")
        .icon(icon("documents"))
        .child(S.document().schemaType("pageSettings").documentId("pageSettings").title("Faqet e tjera")),
      S.listItem()
        .title("Cilësimet e faqes")
        .icon(icon("cog"))
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Cilësimet e faqes")),
    ]);

/** Leads workspace ("Kërkesat"): newest first, status badge on every item (CMS §4). */
export const leadsStructure: StructureResolver = (S) =>
  S.list()
    .title("Kërkesat")
    .items([
      S.listItem()
        .title("Kërkesa për ofertë")
        .icon(icon("envelope"))
        .child(
          S.documentTypeList("quoteRequest")
            .title("Kërkesa për ofertë")
            .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
        ),
      S.listItem()
        .title("Tender / B2B")
        .icon(icon("case"))
        .child(
          S.documentTypeList("tenderRequest")
            .title("Tender / B2B")
            .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
        ),
      S.listItem()
        .title("Aplikime pune")
        .icon(icon("user"))
        .child(
          S.documentTypeList("jobApplication")
            .title("Aplikime pune")
            .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
        ),
    ]);
