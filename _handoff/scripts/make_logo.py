"""Build the Visad logo as clean SVGs (faithful redraw of the 128x50 PNG, scaled x10)."""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
RED = "#F2000D"

# ---- outline "CONSTRUCTION" with Inter SemiBold, letter-spaced, fitted to x 625..1212, baseline 490
font = TTFont("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf")
gs = font.getGlyphSet(); cmap = font.getBestCmap()
cap = font["OS/2"].sCapHeight
def outline(text, x0, x1, baseline, capH):
    s = capH / cap
    adv = [gs[cmap[ord(c)]].width * s for c in text]
    track = ((x1 - x0) - sum(adv)) / (len(text) - 1)
    x, d = x0, []
    for c, a in zip(text, adv):
        pen = SVGPathPen(gs)
        gs[cmap[ord(c)]].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
        d.append(pen.getCommands()); x += a + track
    return " ".join(d)
construction = outline("CONSTRUCTION", 620, 1228, 494, 48)

V = "M10 110H90L170 310L250 110H320L210 400H120Z"
I = "M350 110H430V400H350Z"
A = ("M730 110H830L940 400H750L732 360H712L700 400H620Z"
     "M780 200L822 330H732Z")
D = ("M960 110H1135C1200 110 1230 150 1230 215V300C1230 365 1195 400 1130 400H960Z"
     "M1040 180H1105C1135 180 1150 200 1150 230V285C1150 312 1135 330 1100 330H1040Z")
SWOOSH = "M-20 460H430Q482 460 505 400L615 110Q642 40 700 40H1300"
CLIP = '<clipPath id="c"><path d="M0 500L22 418V0H1282L1262 82V500Z"/></clipPath>'

def svg(letters, swoosh, sub, w=1280, h=500, with_sub=True):
    sub_el = f'<path d="{construction}" fill="{sub}"/>' if with_sub else ""
    vb_h = h if with_sub else 420
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {vb_h}" role="img" aria-label="VISAD Construction">'
            f'<title>VISAD Construction</title><defs>{CLIP}</defs>'
            f'<path d="{V}{I}" fill="{letters}"/><path d="{A}{D}" fill="{letters}" fill-rule="evenodd"/>'
            f'<path id="swoosh" d="{SWOOSH}" fill="none" stroke="{swoosh}" stroke-width="80" stroke-linejoin="round" clip-path="url(#c)"/>'
            f'{sub_el}</svg>')

variants = {
    "visad-logo-on-dark.svg":   svg("#FFFFFF", RED, RED),
    "visad-logo-on-light.svg":  svg("#111214", RED, RED),
    "visad-logo-white.svg":     svg("#FFFFFF", "#FFFFFF", "#FFFFFF"),
    "visad-logo-black.svg":     svg("#111214", "#111214", "#111214"),
    "visad-wordmark-on-dark.svg":  svg("#FFFFFF", RED, RED, with_sub=False),
    "visad-wordmark-on-light.svg": svg("#111214", RED, RED, with_sub=False),
}
for name, s in variants.items():
    open(os.path.join(OUT, name), "w").write(s)

# icon / favicon: the red S-swoosh on a dark square
icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#0E0F11"/>'
        '<g transform="translate(256 256) scale(0.74) translate(-565 -250)">'
        '<path d="M330 460H430Q482 460 505 400L615 110Q642 40 700 40H800" fill="none" stroke="#F2000D" stroke-width="80" stroke-linejoin="round"/></g></svg>')
open(os.path.join(OUT, "visad-icon.svg"), "w").write(icon)
print("ok", list(variants) + ["visad-icon.svg"])
