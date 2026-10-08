import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
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
};

export const viewport: Viewport = {
  themeColor: "#0E0F11",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
