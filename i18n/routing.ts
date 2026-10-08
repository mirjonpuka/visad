import { defineRouting } from "next-intl/routing";

export const locales = ["sq", "en", "it", "de"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "sq",
  // Albanian at "/", others prefixed (Architecture §3)
  localePrefix: "as-needed",
  // No automatic browser-language redirect; the switcher sets NEXT_LOCALE
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/sistemet": { sq: "/sistemet", en: "/systems", it: "/sistemi", de: "/systeme" },
    "/sistemet/[slug]": {
      sq: "/sistemet/[slug]",
      en: "/systems/[slug]",
      it: "/sistemi/[slug]",
      de: "/systeme/[slug]",
    },
    "/projektet": { sq: "/projektet", en: "/projects", it: "/progetti", de: "/projekte" },
    "/projektet/[slug]": {
      sq: "/projektet/[slug]",
      en: "/projects/[slug]",
      it: "/progetti/[slug]",
      de: "/projekte/[slug]",
    },
    "/fabrika": { sq: "/fabrika", en: "/factory", it: "/fabbrica", de: "/fabrik" },
    "/zgjidhje/[segment]": {
      sq: "/zgjidhje/[segment]",
      en: "/solutions/[segment]",
      it: "/soluzioni/[segment]",
      de: "/loesungen/[segment]",
    },
    "/karriera": { sq: "/karriera", en: "/careers", it: "/lavora-con-noi", de: "/karriere" },
    "/karriera/[slug]": {
      sq: "/karriera/[slug]",
      en: "/careers/[slug]",
      it: "/lavora-con-noi/[slug]",
      de: "/karriere/[slug]",
    },
    "/kontakt": { sq: "/kontakt", en: "/contact", it: "/contatti", de: "/kontakt" },
    "/privatesia": { sq: "/privatesia", en: "/privacy", it: "/privacy", de: "/datenschutz" },
    // Dev-only routes (blocked in production, see lib/dev.ts)
    "/dev/kit": "/dev/kit",
    "/dev/cms": "/dev/cms",
    "/dev/profile-render": "/dev/profile-render",
  },
});

export type AppPathname = keyof typeof routing.pathnames;
