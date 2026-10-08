import { createElement } from "react";
import { Icon, type IconSymbol } from "@sanity/icons";

/**
 * @sanity/icons v5 exports one <Icon symbol="…"> instead of named icons.
 * `icon("cog")` returns a component usable as a schema/structure icon.
 */
export function icon(symbol: IconSymbol) {
  const Component = () => createElement(Icon, { symbol });
  Component.displayName = `Icon(${symbol})`;
  return Component;
}
