"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";

type Props = {
  title: string;
  address: string;
  hours: { days: string; hours: string }[];
  mapsUrl: string;
  embedQuery: string;
  labels: { address: string; hours: string; directions: string; loadMap: string; mapNote: string; mapTitle: string };
};

/**
 * Map & visit (UI §8.7, §11.3). The interactive Google map loads only after
 * a click (performance + privacy: no Google request before consent).
 */
export function MapVisit({ title, address, hours, mapsUrl, embedQuery, labels }: Props) {
  const [load, setLoad] = useState(false);

  return (
    <section className="surface-dark section-y">
      <div className="site-container grid-12 gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <h2 className="text-h2">{title}</h2>
          <dl className="mt-10 flex flex-col gap-8">
            <div>
              <dt className="font-mono text-label text-text-on-dark-3 uppercase">{labels.address}</dt>
              <dd className="mt-2 text-body">{address}</dd>
            </div>
            <div>
              <dt className="font-mono text-label text-text-on-dark-3 uppercase">{labels.hours}</dt>
              <dd className="mt-2 text-body">
                {hours.length ? (
                  <ul>
                    {hours.map((h) => (
                      <li key={h.days} className="flex justify-between gap-6">
                        <span>{h.days}</span>
                        <span className="font-mono tabular">{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "[TO CONFIRM]"
                )}
              </dd>
            </div>
          </dl>
          <LinkArrow externalHref={mapsUrl} className="mt-10">
            {labels.directions}
          </LinkArrow>
        </div>

        <div className="relative col-span-12 aspect-[16/10] overflow-hidden rounded-base bg-ink-800 lg:col-span-7 lg:col-start-6">
          {load ? (
            <iframe
              title={labels.mapTitle}
              src={`https://www.google.com/maps?q=${encodeURIComponent(embedQuery)}&z=14&output=embed`}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.4]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
              {/* Static stand-in: a quiet grid with a red pin (no third-party request) */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--color-line-dark)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-dark)_1px,transparent_1px)] [background-size:48px_48px]"
              />
              <MapPin size={36} strokeWidth={1.5} className="relative text-red-500" aria-hidden />
              <button type="button" onClick={() => setLoad(true)} className="btn btn-secondary btn-md relative">
                <span className="btn__fill" aria-hidden />
                <span className="btn__label">{labels.loadMap}</span>
              </button>
              <p className="relative max-w-[320px] text-body-s text-text-on-dark-3">{labels.mapNote}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
