import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Plus, X, ArrowUpRight, Download } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonPrimary, ButtonSecondary, ButtonWhatsApp } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";
import { CMSImage } from "@/components/media/CMSImage";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import {
  SkeletonCard,
  SkeletonImage,
  SkeletonRow,
  SkeletonText,
  SkeletonTile,
  SkeletonTitle,
} from "@/components/media/Skeleton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { FooterCta } from "@/components/layout/Footer";
import { devRoutesEnabled } from "@/lib/dev";
import { localImage } from "@/lib/images";
import { ViewportBadge } from "./ViewportBadge";

export const metadata: Metadata = { title: "UI kit", robots: { index: false, follow: false } };

const STATES = ["default", "hover", "active", "focus"] as const;

const SYSTEMS = [
  ["Dyer", "Dyer hyrëse dhe të brendshme alumini me profile të holla, izolim termik dhe siguri të lartë."],
  [
    "Dritare",
    "Dritare alumini dhe PVC me linja të holla, hapje të brendshme dhe të jashtme, për çdo lloj ndërtese.",
  ],
  [
    "Sisteme rrëshqitëse",
    "Dyer rrëshqitëse dhe palosëse me panele të mëdha xhami, lëvizje të lehtë dhe opsion rrjete kundër insekteve.",
  ],
  ["Grila", "Grila alumini dhe PVC për izolim termik, akustik dhe vizual, të prodhuara sipas masës."],
  [
    "Ballkone & parmakë",
    "Parmakë xhami, alumini dhe inoksi për ballkone e shkallë, me materiale jetëgjata dhe të sigurta.",
  ],
  ["Fasada", "Fasada xhami dhe alumini për ndërtesa banimi dhe komerciale, nga projektimi deri te montimi."],
] as const;

const COLORS = [
  ["ink-950", "bg-ink-950"],
  ["ink-900", "bg-ink-900"],
  ["ink-800", "bg-ink-800"],
  ["ink-700", "bg-ink-700"],
  ["ink-600", "bg-ink-600"],
  ["alu-50", "bg-alu-50"],
  ["alu-100", "bg-alu-100"],
  ["alu-200", "bg-alu-200"],
  ["alu-300", "bg-alu-300"],
  ["red-500", "bg-red-500"],
  ["red-600", "bg-red-600"],
  ["red-700", "bg-red-700"],
  ["red-text-on-dark", "bg-red-text-on-dark"],
  ["whatsapp", "bg-whatsapp"],
  ["text-on-dark", "bg-text-on-dark"],
  ["text-on-dark-2", "bg-text-on-dark-2"],
  ["text-on-dark-3", "bg-text-on-dark-3"],
  ["text-on-light", "bg-text-on-light"],
  ["text-on-light-2", "bg-text-on-light-2"],
  ["text-on-light-3", "bg-text-on-light-3"],
] as const;

const TYPE = [
  ["display-xl", "text-display-xl", "Precizion në çdo profil."],
  ["display-l", "text-display-l", "Keni një projekt?"],
  ["h1", "text-h1", "Fabrika jonë në Shkodër."],
  ["h2", "text-h2", "Sisteme për çdo hapje."],
  ["h3", "text-h3", "Sisteme rrëshqitëse"],
  ["h4", "text-h4", "Zhvillues & ndërtues"],
  ["body-l", "text-body-l", "Dyer, dritare dhe fasada alumini, të prodhuara në fabrikën tonë në Shkodër."],
  ["body", "text-body", "Çdo dritare dhe derë prodhohet në fabrikën tonë në Shkodër. Ë ë Ç ç"],
  ["body-s", "text-body-s", "Shkodër · Dritare · 2024"],
  ["eyebrow", "font-mono text-eyebrow uppercase", "01 — Sistemet"],
  ["label", "font-mono text-label uppercase", "Fleta teknike (PDF)"],
  ["stat", "text-stat tabular", "9500+"],
] as const;

function KitSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-line-dark py-16">
      <div className="site-container">
        <h2 className="mb-8 font-mono text-eyebrow text-text-on-dark-3 uppercase">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Renders the same content on a dark and a light surface. */
function Both({ children }: { children: (surface: "dark" | "light") => ReactNode }) {
  return (
    <div className="site-container grid gap-px lg:grid-cols-2">
      {(["dark", "light"] as const).map((s) => (
        <div key={s} className={`surface-${s} min-w-0 p-6 md:p-10`}>
          <p className="mb-6 font-mono text-label text-(--surface-fg-3) uppercase">surface-{s}</p>
          {children(s)}
        </div>
      ))}
    </div>
  );
}

function StateLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block font-mono text-[10px] tracking-[0.1em] text-(--surface-fg-3) uppercase">
      {children}
    </span>
  );
}

export default async function KitPage() {
  if (!devRoutesEnabled) notFound();
  const t = await getTranslations();

  return (
    <div className="surface-dark pt-(--navbar-h) pb-32">
      <ViewportBadge />

      <header className="site-container pt-16 pb-10">
        <Breadcrumbs items={[{ label: "Dev" }, { label: "UI kit" }]} />
        <p className="mt-10 font-mono text-eyebrow text-text-on-dark-3 uppercase">Dev · Phase 1–2</p>
        <h1 className="mt-4 text-h1">UI kit</h1>
        <p className="mt-4 max-w-[560px] text-body-l text-text-on-dark-2">
          Every component in every state, on dark and light. Check at 1440, 1024, 768 and 390 wide.
        </p>
        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-label uppercase">
          {[
            "colours",
            "type",
            "buttons",
            "links",
            "chips",
            "header",
            "accordion",
            "tabs",
            "skeletons",
            "images",
            "logo",
            "cookie",
            "footer-cta",
          ].map((s) => (
            <a key={s} href={`#${s}`} className="text-text-on-dark-2 hover:text-text-on-dark">
              {s}
            </a>
          ))}
        </nav>
      </header>

      <KitSection id="colours" title="Colour tokens">
        <div className="site-container grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {COLORS.map(([name, cls]) => (
            <div key={name}>
              <div className={`${cls} h-16 rounded-base ring-1 ring-line-dark`} />
              <p className="mt-2 font-mono text-label text-text-on-dark-2">{name}</p>
            </div>
          ))}
        </div>
      </KitSection>

      <KitSection id="type" title="Type scale (fluid 390 → 1440)">
        <div className="site-container flex flex-col">
          {TYPE.map(([name, cls, sample]) => (
            <div
              key={name}
              className="grid gap-2 border-t border-line-dark py-5 md:grid-cols-[140px_1fr] md:gap-8"
            >
              <span className="font-mono text-label text-text-on-dark-3 uppercase">{name}</span>
              <span className={`${cls} min-w-0 break-words`}>{sample}</span>
            </div>
          ))}
        </div>
      </KitSection>

      <KitSection id="buttons" title="Buttons">
        <Both>
          {(surface) => (
            <div className="flex flex-col gap-10">
              {(["md", "lg"] as const).map((size) => (
                <div key={size} className="flex flex-col gap-6">
                  <p className="font-mono text-label text-(--surface-fg-2) uppercase">Size {size}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-5">
                    {STATES.map((state) => (
                      <div key={state} className="flex flex-col gap-2">
                        <StateLabel>Primary · {state}</StateLabel>
                        <ButtonPrimary size={size} arrow data-force={state}>
                          {t("cta.quote")}
                        </ButtonPrimary>
                      </div>
                    ))}
                    <div className="flex flex-col gap-2">
                      <StateLabel>Primary · loading</StateLabel>
                      <ButtonPrimary size={size} arrow loading>
                        {t("cta.quote")}
                      </ButtonPrimary>
                    </div>
                    <div className="flex flex-col gap-2">
                      <StateLabel>Primary · disabled</StateLabel>
                      <ButtonPrimary size={size} arrow disabled>
                        {t("cta.quote")}
                      </ButtonPrimary>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-5">
                    {STATES.map((state) => (
                      <div key={state} className="flex flex-col gap-2">
                        <StateLabel>Secondary · {state}</StateLabel>
                        <ButtonSecondary size={size} data-force={state}>
                          {t("cta.projects")}
                        </ButtonSecondary>
                      </div>
                    ))}
                    <div className="flex flex-col gap-2">
                      <StateLabel>Secondary · loading</StateLabel>
                      <ButtonSecondary size={size} loading>
                        {t("cta.projects")}
                      </ButtonSecondary>
                    </div>
                    <div className="flex flex-col gap-2">
                      <StateLabel>Secondary · disabled</StateLabel>
                      <ButtonSecondary size={size} disabled>
                        {t("cta.projects")}
                      </ButtonSecondary>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-6">
                <p className="font-mono text-label text-(--surface-fg-2) uppercase">WhatsApp (lg)</p>
                <div className="flex flex-wrap gap-x-4 gap-y-5">
                  {STATES.map((state) => (
                    <div key={state} className="flex flex-col gap-2">
                      <StateLabel>{state}</StateLabel>
                      <ButtonWhatsApp externalHref="https://wa.me/355673772989" newTab data-force={state}>
                        {t("cta.whatsapp")}
                      </ButtonWhatsApp>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-mono text-label text-(--surface-fg-2) uppercase">
                  Full width (phone pattern)
                </p>
                <div className="flex max-w-[360px] flex-col gap-3">
                  <ButtonPrimary size="lg" arrow href="/kontakt" className="w-full">
                    {t("cta.quote")}
                  </ButtonPrimary>
                  <ButtonSecondary size="lg" href="/projektet" className="w-full">
                    {t("cta.projects")}
                  </ButtonSecondary>
                </div>
              </div>
              <p className="text-body-s text-(--surface-fg-3)">
                Live: hover and Tab through the buttons above. Surface: {surface}.
              </p>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="links" title="LinkArrow & IconButton">
        <Both>
          {() => (
            <div className="flex flex-col gap-10">
              <div className="flex flex-wrap gap-x-10 gap-y-6">
                {(["default", "hover", "focus"] as const).map((state) => (
                  <div key={state} className="flex flex-col gap-2">
                    <StateLabel>{state}</StateLabel>
                    <LinkArrow href="/sistemet" data-force={state}>
                      {t("cta.allSystems")}
                    </LinkArrow>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <StateLabel>Mono</StateLabel>
                  <LinkArrow href="/sistemet" mono>
                    {t("cta.details")}
                  </LinkArrow>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-6">
                {(["default", "hover", "focus"] as const).map((state) => (
                  <div key={state} className="flex flex-col gap-2">
                    <StateLabel>44 · {state}</StateLabel>
                    <IconButton label={t("a11y.open")} data-force={state}>
                      <Plus size={20} strokeWidth={1.5} />
                    </IconButton>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <StateLabel>40</StateLabel>
                  <IconButton label={t("a11y.close")} size={40}>
                    <X size={18} strokeWidth={1.5} />
                  </IconButton>
                </div>
                <div className="flex flex-col gap-2">
                  <StateLabel>disabled</StateLabel>
                  <IconButton label="Download" disabled>
                    <Download size={18} strokeWidth={1.5} />
                  </IconButton>
                </div>
                <div className="flex flex-col gap-2">
                  <StateLabel>40</StateLabel>
                  <IconButton label="Open" size={40}>
                    <ArrowUpRight size={18} strokeWidth={1.5} />
                  </IconButton>
                </div>
              </div>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="chips" title="Chips">
        <Both>
          {() => (
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap gap-x-3 gap-y-5">
                {(["default", "hover", "focus"] as const).map((state) => (
                  <div key={state} className="flex flex-col gap-2">
                    <StateLabel>{state}</StateLabel>
                    <Chip data-force={state}>{t("projects.types.villa")}</Chip>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <StateLabel>active</StateLabel>
                  <Chip active>{t("projects.types.hotel")}</Chip>
                </div>
                <div className="flex flex-col gap-2">
                  <StateLabel>count</StateLabel>
                  <Chip count={2}>{t("projects.filters.filter")}</Chip>
                </div>
                <div className="flex flex-col gap-2">
                  <StateLabel>disabled</StateLabel>
                  <Chip disabled>{t("projects.types.public")}</Chip>
                </div>
              </div>
              <div>
                <StateLabel>Filter group · {t("projects.filters.type")}</StateLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["residential", "villa", "hotel", "commercial", "public"] as const).map((k, i) => (
                    <Chip key={k} active={i === 2}>
                      {t(`projects.types.${k}`)}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="header" title="SectionHeader">
        <Both>
          {(surface) =>
            surface === "dark" ? (
              <SectionHeader
                eyebrow="01 — Sistemet"
                title="Sisteme për çdo hapje."
                aside={<LinkArrow href="/sistemet">{t("cta.allSystems")}</LinkArrow>}
                className="mb-0"
              />
            ) : (
              <SectionHeader
                eyebrow="02 — Projektet"
                title="Projekte të zgjedhura."
                aside="Nga vila private te hotele dhe ndërtesa banimi, punë të realizuara nga ekipi ynë në Shqipëri dhe në rajon."
                className="mb-0"
              />
            )
          }
        </Both>
      </KitSection>

      <KitSection id="accordion" title="Accordion (lg = Home systems · sm = FAQ)">
        <Both>
          {(surface) =>
            surface === "dark" ? (
              <Accordion
                items={SYSTEMS.map(([name, text], i) => ({
                  id: name,
                  number: String(i + 1).padStart(2, "0"),
                  title: name,
                  content: (
                    <div className="flex max-w-[460px] flex-col gap-5">
                      <p className="text-body text-(--surface-fg-2)">{text}</p>
                      <div className="flex flex-wrap gap-6">
                        <LinkArrow href="/sistemet" mono>
                          {t("cta.details")}
                        </LinkArrow>
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Accordion
                size="sm"
                defaultOpen={null}
                items={[1, 2, 3].map((n) => ({
                  id: `faq-${n}`,
                  title: `[TO CONFIRM] Pyetje e shpeshtë ${n}`,
                  content: (
                    <p className="max-w-[640px] text-body text-(--surface-fg-2)">[TO CONFIRM] Përgjigja.</p>
                  ),
                }))}
              />
            )
          }
        </Both>
      </KitSection>

      <KitSection id="tabs" title="Tabs">
        <Both>
          {() => (
            <Tabs
              label="Forma"
              items={[
                {
                  id: "quote",
                  label: "Kërko ofertë",
                  content: <SkeletonText lines={3} />,
                },
                {
                  id: "tender",
                  label: "Tender / B2B",
                  content: <SkeletonText lines={5} size={12} />,
                },
              ]}
            />
          )}
        </Both>
      </KitSection>

      <KitSection id="skeletons" title="Skeletons (shimmer off with reduced motion)">
        <Both>
          {() => (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonTitle h2 ×2</StateLabel>
                  <SkeletonTitle lines={2} />
                </div>
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonText 16 / 12</StateLabel>
                  <SkeletonText lines={3} />
                  <SkeletonText lines={2} size={12} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonImage 16:10</StateLabel>
                  <SkeletonImage />
                </div>
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonTile</StateLabel>
                  <SkeletonTile className="min-h-0" style={{ aspectRatio: "16/10" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonCard 4:5</StateLabel>
                  <SkeletonCard />
                </div>
                <div className="flex flex-col gap-3">
                  <StateLabel>SkeletonRow</StateLabel>
                  <div>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="images" title="CMSImage & PlaceholderImage">
        <Both>
          {(surface) => (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <StateLabel>CMSImage · crop 16:10</StateLabel>
                <CMSImage
                  image={localImage(
                    surface === "dark"
                      ? "project-fishta-hotel-glass-balconies"
                      : "visad-headquarters-factory",
                    "wide-16x10",
                  )}
                  ratio="16/10"
                  sizes="(min-width: 1440px) 320px, (min-width: 1024px) 22vw, (min-width: 768px) 40vw, 90vw"
                />
              </div>
              <div className="flex flex-col gap-3">
                <StateLabel>CMSImage · square → 4:5 box</StateLabel>
                <CMSImage
                  image={localImage(
                    surface === "dark" ? "railing-glass-staircase" : "window-pvc-historic-facade",
                  )}
                  ratio="4/5"
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 40vw, 90vw"
                />
              </div>
              <div className="flex flex-col gap-3">
                <StateLabel>CMSImage · empty slot</StateLabel>
                <CMSImage
                  image={null}
                  ratio="16/10"
                  sizes="40vw"
                  placeholderNote="PHOTO: close-up of a modern aluminium window corner, anthracite, daylight"
                />
              </div>
              <div className="flex flex-col gap-3">
                <StateLabel>PlaceholderImage 4:5</StateLabel>
                <PlaceholderImage
                  ratio="4/5"
                  note="PHOTO: technical drawings next to aluminium profile samples"
                />
              </div>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="logo" title="Logo">
        <Both>
          {(surface) => (
            <div className="flex flex-col gap-8">
              <Image
                src={`/brand/logo/visad-logo-on-${surface}.svg`}
                alt="VISAD Construction"
                width={280}
                height={109}
                className="h-auto w-[280px]"
              />
              <div className="flex items-end gap-8">
                <div className="flex flex-col gap-2">
                  <StateLabel>Wordmark 104 (navbar laptop)</StateLabel>
                  <Image
                    src={`/brand/logo/visad-wordmark-on-${surface}.svg`}
                    alt="VISAD"
                    width={104}
                    height={41}
                    className="h-auto w-[104px]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <StateLabel>Wordmark 88 (phone)</StateLabel>
                  <Image
                    src={`/brand/logo/visad-wordmark-on-${surface}.svg`}
                    alt="VISAD"
                    width={88}
                    height={34}
                    className="h-auto w-[88px]"
                  />
                </div>
              </div>
            </div>
          )}
        </Both>
      </KitSection>

      <KitSection id="cookie" title="CookieBanner (preview — off at launch, D1.37)">
        <div className="site-container">
          <CookieBanner preview />
        </div>
      </KitSection>

      <section id="footer-cta" className="border-t border-line-dark pt-16">
        <div className="site-container">
          <h2 className="mb-8 font-mono text-eyebrow text-text-on-dark-3 uppercase">
            FooterCta (pages without the CTA section)
          </h2>
        </div>
        <FooterCta />
      </section>
    </div>
  );
}
