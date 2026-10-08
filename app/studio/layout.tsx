// Separate root layout: the Studio has its own UI and no site chrome.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
