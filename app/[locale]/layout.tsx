import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { locale as rootLocale } from "next/root-params";
import { Suspense } from "react";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { DraftModeTools } from "@/components/layout/DraftModeTools";
import { SiteDataProvider } from "@/components/layout/SiteDataProvider";
import { getSiteData } from "@/lib/site-data";
import { Footer } from "@/components/layout/Footer";
import { LayoutUIProvider } from "@/components/layout/LayoutUIProvider";
import { Navbar } from "@/components/layout/Navbar";
import { SkipLink } from "@/components/layout/SkipLink";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { Cursor } from "@/components/motion/Cursor";
import { IntroOverlay, introHeadScript } from "@/components/motion/IntroOverlay";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { RouteChangeEmitter } from "@/components/motion/routeEvents";
import { TransitionProvider } from "@/components/motion/TransitionProvider";
import { BusinessJsonLd } from "@/components/seo/JsonLd";
import { PREVIEW_SITE } from "@/lib/preview-site";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";

// Brand §3: Geist + Geist Mono only, latin + latin-ext (ë, ç)
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al"),
  title: { default: "VISAD Construction", template: "%s · VISAD" },
  description: "Sisteme alumini dhe PVC. Prodhim dhe montim në Shkodër.",
  // Client review deployment: never indexed
  ...(PREVIEW_SITE ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0E0F11",
  colorScheme: "dark",
};

// The whole layout is localized (menus and footer come from Sanity per locale),
// so it can never sit in the locale-independent App Shell of Partial
// Prefetching. Each locale is still fully prerendered, and the layout persists
// across navigations, so nothing blocks. Pages keep their own validation and
// stream behind loading.tsx skeletons (UI §13.1).
export const instant = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  const siteData = await getSiteData();

  return (
    // The head script sets classes/attributes on <html> before hydration
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether motion runs and the intro plays (Motion §2).
            Must stay a plain inline script: next/script "beforeInteractive" runs it later. */}
        <script dangerouslySetInnerHTML={{ __html: introHeadScript }} />
        {/* All CMS photos come from here: open the connection early (A2) */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      </head>
      <body>
        <NextIntlClientProvider>
          <SiteDataProvider value={siteData}>
            <MotionProvider>
              <LenisProvider>
                <LayoutUIProvider>
                  <TransitionProvider>
                    <IntroOverlay />
                    <SkipLink />
                    <Navbar />
                    <main id="main" tabIndex={-1} className="outline-none">
                      {children}
                    </main>
                    <Footer />
                    <WhatsAppFab />
                    <CookieBanner />
                  </TransitionProvider>
                  <Cursor />
                </LayoutUIProvider>
              </LenisProvider>
            </MotionProvider>
          </SiteDataProvider>
        </NextIntlClientProvider>
        <BusinessJsonLd site={siteData} locale={locale} />
        {/* Cookieless (Architecture §1), so no consent needed; they read the URL → Suspense */}
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
        <Suspense fallback={null}>
          <DraftModeTools />
        </Suspense>
        {/* The only place that reads the URL for motion (see routeEvents.tsx) */}
        <Suspense fallback={null}>
          <RouteChangeEmitter />
        </Suspense>
      </body>
    </html>
  );
}
