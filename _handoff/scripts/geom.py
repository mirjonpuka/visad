"""Perspective straightening + symmetric centred crop for architectural photos."""
import cv2, numpy as np
from PIL import Image

def _segments(gray):
    lsd = cv2.createLineSegmentDetector(0)
    lines = lsd.detect(gray)[0]
    return np.zeros((0, 4)) if lines is None else lines.reshape(-1, 4)

def _vp(segs, want, h, w, tol_deg=22, min_len=0.05):
    """Vanishing point (homogeneous) of near-vertical ('v') or near-horizontal ('h') segments."""
    rows, wts = [], []
    for x1, y1, x2, y2 in segs:
        dx, dy = x2 - x1, y2 - y1
        L = np.hypot(dx, dy)
        if L < min_len * min(h, w): continue
        ang = np.degrees(np.arctan2(abs(dy), abs(dx)))  # 90 = vertical
        if want == "v" and ang < 90 - tol_deg: continue
        if want == "h" and ang > tol_deg: continue
        l = np.cross([x1, y1, 1.0], [x2, y2, 1.0]); l /= np.hypot(l[0], l[1])
        rows.append(l * L); wts.append(L)
    if len(rows) < 4: return None, 0
    _, _, vt = np.linalg.svd(np.array(rows))
    return vt[-1], len(rows)

def _vertical_H(vp, w, h, s):
    if vp is None: return np.eye(3)
    X, Y, Z = vp
    src_b = np.float32([[0.2 * w, h], [0.8 * w, h]])
    def top(pb):  # point at y=0 on the line from pb toward vp
        if abs(Z) < 1e-9:  # vp at infinity: direction (X,Y)
            d = np.array([X, Y]);
        else:
            d = np.array([X / Z, Y / Z]) - pb
        if abs(d[1]) < 1e-6: return np.array([pb[0], 0.0])
        t = -pb[1] / d[1]; return pb + t * d
    src_t = np.float32([top(p) for p in src_b])
    dst_t = np.float32([[src_b[i][0] * s + src_t[i][0] * (1 - s), 0] for i in range(2)])
    src = np.float32([src_t[0], src_t[1], src_b[0], src_b[1]])
    dst = np.float32([dst_t[0], dst_t[1], src_b[0], src_b[1]])
    return cv2.getPerspectiveTransform(src, dst)

def _horizontal_H(vp, w, h, s):
    if vp is None: return np.eye(3)
    X, Y, Z = vp
    src_l = np.float32([[0, 0.25 * h], [0, 0.75 * h]])
    def right(pl):
        d = np.array([X, Y]) if abs(Z) < 1e-9 else np.array([X / Z, Y / Z]) - pl
        if abs(d[0]) < 1e-6: return np.array([w, pl[1]])
        t = (w - pl[0]) / d[0]; return pl + t * d
    src_r = np.float32([right(p) for p in src_l])
    dst_r = np.float32([[w, src_l[i][1] * s + src_r[i][1] * (1 - s)] for i in range(2)])
    src = np.float32([src_l[0], src_l[1], src_r[0], src_r[1]])
    dst = np.float32([src_l[0], src_l[1], dst_r[0], dst_r[1]])
    return cv2.getPerspectiveTransform(src, dst)

def _inner_crop(mask, cx, cy, aspect, zoom=1.0):
    """Largest rect of given aspect, centred as close to (cx,cy) as possible, fully inside mask."""
    h, w = mask.shape
    integ = cv2.integral((mask > 0).astype(np.uint8))
    def ok(x0, y0, x1, y1):
        tot = integ[y1, x1] - integ[y0, x1] - integ[y1, x0] + integ[y0, x0]
        return tot >= (x1 - x0) * (y1 - y0) * 0.999
    best = None
    for frac in np.linspace(zoom, 0.3, 71):
        rh = int(min(h, w / aspect) * frac); rw = int(rh * aspect)
        # try centres near the requested one
        for dcx in np.linspace(0, 0.25, 11):
            for sx in (1, -1):
                for dcy in (0, 0.03, -0.03, 0.06, -0.06):
                    x0 = int(np.clip((cx + sx * dcx) * w - rw / 2, 0, w - rw)); y0 = int(np.clip((cy + dcy) * h - rh / 2, 0, h - rh))
                    if ok(x0, y0, x0 + rw, y0 + rh):
                        best = (x0, y0, x0 + rw, y0 + rh); break
                if best: break
            if best: break
        if best: break
    return best

def straighten(img: Image.Image, v=0.85, hz=0.0, cx=0.5, cy=0.5, aspect=1.0, zoom=1.0, debug=False):
    a = np.asarray(img)
    h, w = a.shape[:2]
    sc = 1024 / max(h, w)
    small = cv2.resize(cv2.cvtColor(a, cv2.COLOR_RGB2GRAY), None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
    segs = _segments(small) / sc
    H = np.eye(3); info = {}
    if v > 0:
        vp, n = _vp(segs, "v", h, w); info["v_lines"] = n
        H = _vertical_H(vp, w, h, v) @ H
    if hz > 0:
        # re-detect horizontals in the vertically corrected frame
        warped = cv2.warpPerspective(a, H, (w, h))
        small2 = cv2.resize(cv2.cvtColor(warped, cv2.COLOR_RGB2GRAY), None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        vp2, n2 = _vp(_segments(small2) / sc, "h", h, w); info["h_lines"] = n2
        H = _horizontal_H(vp2, w, h, hz) @ H
    out = cv2.warpPerspective(a, H, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
    mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), H, (w, h), flags=cv2.INTER_NEAREST)
    mask = cv2.erode(mask, np.ones((5, 5), np.uint8))
    box = _inner_crop(mask, cx, cy, aspect, zoom)
    info["crop"] = box
    res = Image.fromarray(out).crop(box) if box else Image.fromarray(out)
    return res, info
