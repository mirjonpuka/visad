"""Edit upscaled photos (gentle grade + sharpen), export masters, WebP sizes, slot crops and manifest."""
import json, os, sys
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geom import straighten
GEOM = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "geom_params.json")))

UP, SRC, OUT = sys.argv[1:4]
PHOTOS = [
  # id, file, name, alt_sq, alt_en, kind, slots, crops {slot: (aspect_w, aspect_h, focus_x, focus_y)}
  ("2518871a", "2518871a-image.jpg", "project-terrace-glass-railing-vineyard",
   "Tarracë me parmakë xhami dhe alumini me pamje nga vreshtat dhe malet",
   "Terrace with glass and aluminium railing overlooking vineyards and mountains",
   "project", ["home-hero", "projects-index", "solution-homeowners-alt"],
   {"hero-16x9": (16, 9, .55, .45), "mobile-4x5": (4, 5, .6, .5)}),
  ("e8b1b074", "e8b1b074-image.jpg", "project-fishta-hotel-glass-balconies",
   "Fishta Hotel me ballkone xhami dhe dyer hyrëse xhami",
   "Fishta Hotel with glass balconies and glass entrance doors",
   "project", ["project-tile-1", "system-facades", "solution-hotels"],
   {"wide-16x10": (16, 10, .5, .45), "tall-4x5": (4, 5, .5, .5)}),
  ("ceb252bb", "ceb252bb-image.jpg", "project-villa-glass-balconies-shutters",
   "Vilë trekatëshe me ballkone xhami, grila të bardha dhe dyer alumini",
   "Three-storey villa with glass balconies, white shutters and aluminium doors",
   "project", ["project-tile-4", "system-shutters", "system-doors"],
   {"door-4x5": (4, 5, .5, .72), "wide-16x10": (16, 10, .5, .5)}),
  ("6423d9f1", "6423d9f1-image.jpg", "project-house-glass-railings",
   "Shtëpi me parmakë xhami në verandë dhe ballkon",
   "House with glass railings on the porch and balcony",
   "project", ["project-tile-2", "solution-homeowners"],
   {"wide-16x10": (16, 10, .5, .55)}),
  ("b07fd7da", "b07fd7da-image.jpg", "project-residential-blocks-balconies",
   "Ndërtesa banimi me ballkone xhami dhe alumini",
   "Residential buildings with glass and aluminium balconies",
   "project", ["project-tile-5", "solution-developers"],
   {"wide-16x10": (16, 10, .6, .5), "tall-4x5": (4, 5, .75, .5)}),
  ("a9d95dd7", "a9d95dd7-image.jpg", "railing-stainless-steel-balcony",
   "Parmak inoksi në ballkon pranë një dritareje alumini",
   "Stainless-steel balcony railing next to an aluminium window",
   "project", ["system-balconies"], {"wide-16x10": (16, 10, .5, .5)}),
  ("e7879d30", "e7879d30-image.jpg", "railing-glass-staircase",
   "Parmak shkallësh me xhama dhe profile alumini",
   "Staircase railing with glass panels and aluminium posts",
   "project", ["project-tile-3", "system-balconies-alt"], {"tall-4x5": (4, 5, .5, .5), "wide-16x10": (16, 10, .5, .5)}),
  ("34a12970", "34a12970-image.jpg", "window-pvc-historic-facade",
   "Dritare e re PVC e montuar në një fasadë guri historike",
   "New PVC window fitted in a historic stone façade",
   "project", ["system-windows"], {"tall-4x5": (4, 5, .5, .5), "wide-16x10": (16, 10, .5, .55)}),
  ("ca8811e3", "ca8811e3-image.png", "installation-folding-doors",
   "Instalues i Visad duke montuar dyer palosëse alumini",
   "Visad installer fitting aluminium folding doors",
   "company", ["factory-3", "system-sliding", "careers-hero"], {"wide-16x10": (16, 10, .55, .5)}),
  ("77999f68", "77999f68-image.png", "visad-headquarters-factory",
   "Selia dhe fabrika e Visad në rrugën Shkodër–Koplik",
   "Visad headquarters and factory on the Shkodër–Koplik road",
   "company", ["factory-1", "factory-hero", "contact"], {"wide-16x10": (16, 10, .5, .5), "hero-16x9": (16, 9, .5, .5)}),
  ("ec9b0385", "ec9b0385-image.png", "visad-truck-aluminium-frames",
   "Kamioni i Visad duke transportuar korniza alumini",
   "Visad truck carrying aluminium frames",
   "company", ["factory-2"], {"wide-16x10": (16, 10, .5, .55)}),
]
WIDTHS = [640, 960, 1600, 2560]

def grade(img):
    a = np.asarray(img).astype(np.float32)
    # partial gray-world white balance (30%)
    means = a.reshape(-1, 3).mean(0); g = means.mean()
    a = a * (1 + 0.3 * (g / means - 1))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img = ImageOps.autocontrast(img, cutoff=(0.4, 0.2))
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Color(img).enhance(1.05)
    return img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=35, threshold=3))

def crop(img, aw, ah, fx, fy):
    W, H = img.size
    if W / H > aw / ah: h, w = H, round(H * aw / ah)
    else: w, h = W, round(W * ah / aw)
    x = min(max(round(fx * W - w / 2), 0), W - w); y = min(max(round(fy * H - h / 2), 0), H - h)
    return img.crop((x, y, x + w, y + h))

for d in ["originals", "edited", "web", "crops"]: os.makedirs(os.path.join(OUT, d), exist_ok=True)
manifest = []
for pid, fname, name, alt_sq, alt_en, kind, slots, crops in PHOTOS:
    orig = Image.open(os.path.join(SRC, fname)).convert("RGB")
    orig.save(os.path.join(OUT, "originals", f"{name}-original.jpg"), quality=95)
    up = Image.open(os.path.join(UP, os.path.splitext(fname)[0] + ".png")).convert("RGB")
    # blend 20% of a plain Lanczos upscale back in, so the AI result keeps a natural photo texture
    up = Image.blend(up, orig.resize(up.size, Image.LANCZOS), 0.2)
    ed = grade(up)
    # straighten verticals/horizontals and crop centred on the subject (symmetry)
    ed, _info = straighten(ed, **GEOM.get(name, {"v": 0}))
    ed.save(os.path.join(OUT, "edited", f"{name}.jpg"), quality=92)
    files = []
    for w in [x for x in WIDTHS if x <= ed.width] + ([ed.width] if ed.width not in WIDTHS else []):
        h = round(ed.height * w / ed.width)
        p = f"web/{name}-{w}.webp"
        ed.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, p), "WEBP", quality=80, method=6)
        files.append({"path": p, "width": w, "height": h})
    crop_files = {}
    for cname, (aw, ah, fx, fy) in crops.items():
        c = crop(ed, aw, ah, fx, fy)
        tw = 2560 if aw > ah else 1080
        tw = min(tw, c.width) if c.width >= 1080 else c.width
        c = c.resize((tw, round(tw * ah / aw)), Image.LANCZOS)
        p = f"crops/{name}-{cname}.webp"
        c.save(os.path.join(OUT, p), "WEBP", quality=80, method=6)
        crop_files[cname] = {"path": p, "width": c.width, "height": c.height}
    small = ed.resize((24, round(24 * ed.height / ed.width)))
    import base64, io
    buf = io.BytesIO(); small.save(buf, "WEBP", quality=40)
    manifest.append({
        "id": name, "kind": kind, "realVisadPhoto": True, "isPlaceholder": False,
        "allowedOnProjectPages": kind == "project" or kind == "company",
        "sourceResolution": list(orig.size), "editedResolution": list(ed.size),
        "alt": {"sq": alt_sq, "en": alt_en}, "slots": slots,
        "edited": f"edited/{name}.jpg", "web": files, "crops": crop_files,
        "blurDataURL": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(),
    })
    print("done", name, ed.size, flush=True)
json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), ensure_ascii=False, indent=2)
print("manifest ok")
