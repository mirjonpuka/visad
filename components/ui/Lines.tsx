import { Fragment } from "react";

/** Renders text with line breaks entered in the CMS ("Precizion në\nçdo profil."). */
export function Lines({ text }: { text?: string | null }) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
