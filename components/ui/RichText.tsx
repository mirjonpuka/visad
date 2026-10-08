import { PortableText, type PortableTextComponents } from "next-sanity";
import type { Blocks } from "@/sanity/lib/types";
import { cn } from "@/lib/utils";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

/** CMS rich text (paragraphs, h2/h3, lists, links) styled by `.rich-text`. */
export function RichText({ value, className }: { value: Blocks; className?: string }) {
  if (!value?.length) return null;
  return (
    <div className={cn("rich-text text-body", className)}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}

/** True when the blocks contain at least one non-empty text span. */
export function hasText(value: Blocks) {
  return Boolean(
    value?.some((block) =>
      ((block.children as { text?: string }[] | undefined) ?? []).some((child) => child.text?.trim()),
    ),
  );
}
