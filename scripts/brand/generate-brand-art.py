#!/usr/bin/env python3
"""Generate lib/brand-art.ts: the Artlantix wordmark outlines, the star mark and the compass emblem.

The wordmark is real glyph geometry from Bricolage Grotesque (SIL OFL 1.1), shaped with HarfBuzz at
weight 800 / optical size 96. The dot of the "i" is replaced by a square pixel. The emblem is pure
geometry (rings, ticks, a split-shaded compass star and petals) so every anchor and Bezier handle shown
by the hero "construction" view is the real geometry of the drawing.

Variable fonts keep overlapping contours (the crossbar of the "A" is a rectangle laid over the legs), which
is invisible when filled but shows in an outline. Each glyph is therefore merged with skia-pathops first.

Usage (needs: pip install fonttools brotli uharfbuzz skia-pathops):
  python3 scripts/brand/generate-brand-art.py node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2
"""
import io
import math
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.recordingPen import RecordingPen
from pathops import Path as SkPath
from fontTools.ttLib import TTFont

OUT = Path(__file__).resolve().parents[2] / 'lib' / 'brand-art.ts'


def fmt(v: float) -> str:
    s = f'{v:.1f}'
    s = s[:-2] if s.endswith('.0') else s
    return '0' if s == '-0' else s


def pt(p):
    return f'{fmt(p[0])} {fmt(p[1])}'


def dedupe(points):
    seen, out = set(), []
    for p in points:
        key = (round(p[0], 1), round(p[1], 1))
        if key not in seen:
            seen.add(key)
            out.append(p)
    return out


# ---------------------------------------------------------------- wordmark

def build_wordmark(font_path: str):
    tt = TTFont(font_path)
    tt.flavor = None
    buf_io = io.BytesIO()
    tt.save(buf_io)
    face = hb.Face(buf_io.getvalue())
    font = hb.Font(face)
    font.set_variations({'wght': 800, 'opsz': 96, 'wdth': 100})
    text = 'Artlantix'
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': False})
    infos, positions = buf.glyph_infos, buf.glyph_positions

    cursor = 0
    contours = []  # (glyph index, list of segments with absolute svg coords)
    for gi, (info, pos) in enumerate(zip(infos, positions)):
        raw = RecordingPen()
        font.draw_glyph_with_pen(info.codepoint, raw)
        merged = SkPath()
        raw.replay(merged.getPen())
        merged.simplify(fix_winding=True, keep_starting_points=False)
        pen = RecordingPen()
        merged.draw(pen)
        current = []
        for op, args in pen.value:
            if op == 'moveTo':
                current = [('M', [(args[0][0] + cursor + pos.x_offset, -(args[0][1] + pos.y_offset))])]
            elif op in ('lineTo', 'qCurveTo', 'curveTo'):
                pts = [(a[0] + cursor + pos.x_offset, -(a[1] + pos.y_offset)) for a in args if a is not None]
                code = {'lineTo': 'L', 'qCurveTo': 'Q', 'curveTo': 'C'}[op]
                current.append((code, pts))
            elif op in ('closePath', 'endPath'):
                contours.append((gi, current))
                current = []
        cursor += pos.x_advance

    # the dot of the "i" is the contour with the highest (smallest svg y) bounding box inside glyph 7
    i_index = text.index('i')
    i_contours = [c for c in contours if c[0] == i_index]

    def bbox(contour):
        xs = [p[0] for _, pts in contour[1] for p in pts]
        ys = [p[1] for _, pts in contour[1] for p in pts]
        return min(xs), min(ys), max(xs), max(ys)

    dot_contour = min(i_contours, key=lambda c: bbox(c)[1])
    dx0, dy0, dx1, dy1 = bbox(dot_contour)
    dot_size = max(dx1 - dx0, dy1 - dy0) * 0.84
    dot_cx, dot_cy = (dx0 + dx1) / 2, (dy0 + dy1) / 2
    contours = [c for c in contours if c is not dot_contour]

    d_parts, anchors, controls, handles = [], [], [], []
    for _, segs in contours:
        prev = None
        for code, pts in segs:
            if code == 'M':
                d_parts.append(f'M{pt(pts[0])}')
                prev = pts[0]
                anchors.append(pts[0])
            elif code == 'L':
                for p in pts:
                    d_parts.append(f'L{pt(p)}')
                    anchors.append(p)
                    prev = p
            elif code == 'Q':
                offs, end = pts[:-1], pts[-1]
                for i in range(len(offs) - 1):
                    mid = ((offs[i][0] + offs[i + 1][0]) / 2, (offs[i][1] + offs[i + 1][1]) / 2)
                    d_parts.append(f'Q{pt(offs[i])} {pt(mid)}')
                d_parts.append(f'Q{pt(offs[-1])} {pt(end)}')
                chain = [prev] + offs + [end]
                for a, b in zip(chain, chain[1:]):
                    handles.append((a[0], a[1], b[0], b[1]))
                controls.extend(offs)
                anchors.append(end)
                prev = end
            elif code == 'C':
                d_parts.append(f'C{pt(pts[0])} {pt(pts[1])} {pt(pts[2])}')
                handles.append((prev[0], prev[1], pts[0][0], pts[0][1]))
                handles.append((pts[1][0], pts[1][1], pts[2][0], pts[2][1]))
                controls.extend(pts[:2])
                anchors.append(pts[2])
                prev = pts[2]
        d_parts.append('Z')

    all_pts = [p for _, segs in contours for _, pts in segs for p in pts] + [(dx0, dy0), (dx1, dy1)]
    min_x = min(p[0] for p in all_pts)
    max_x = max(p[0] for p in all_pts)
    min_y = min(p[1] for p in all_pts)
    max_y = max(p[1] for p in all_pts)
    pad = 6
    vb = (min_x - pad, min_y - pad, (max_x - min_x) + 2 * pad, (max_y - min_y) + 2 * pad)
    return {
        'viewBox': vb,
        'd': ''.join(d_parts),
        'dot': (dot_cx - dot_size / 2, dot_cy - dot_size / 2, dot_size),
        'anchors': dedupe(anchors),
        'controls': dedupe(controls),
        'handles': handles,
    }


# ---------------------------------------------------------------- star mark + emblem

KAPPA = 0.5522847498


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def circle_path(cx, cy, r):
    """Circle as four cubic arcs. Returns (d, anchors, controls, handles)."""
    k = KAPPA * r
    a = [(cx + r, cy), (cx, cy + r), (cx - r, cy), (cx, cy - r)]
    d = f'M{pt(a[0])}'
    controls, handles = [], []
    for i in range(4):
        p0, p1 = a[i], a[(i + 1) % 4]
        # tangent directions (clockwise in svg space)
        t0 = (-(p0[1] - cy) / r, (p0[0] - cx) / r)
        t1 = (-(p1[1] - cy) / r, (p1[0] - cx) / r)
        c0 = (p0[0] + t0[0] * k, p0[1] + t0[1] * k)
        c1 = (p1[0] - t1[0] * k, p1[1] - t1[1] * k)
        d += f'C{pt(c0)} {pt(c1)} {pt(p1)}'
        controls += [c0, c1]
        handles += [(p0[0], p0[1], c0[0], c0[1]), (p1[0], p1[1], c1[0], c1[1])]
    return d + 'Z', a, controls, handles


def star_triangles(cx, cy, r_card, r_inter, r_valley, start_deg=-90):
    """Returns the 16 triangles (tip, valley, centre) of the split-shaded star as (left, right) per point."""
    tris = []
    verts = []
    for k in range(8):
        axis = start_deg + 45 * k
        tip = polar(cx, cy, r_card if k % 2 == 0 else r_inter, axis)
        v_left = polar(cx, cy, r_valley, axis - 22.5)
        v_right = polar(cx, cy, r_valley, axis + 22.5)
        tris.append(((tip, v_left, (cx, cy)), (tip, v_right, (cx, cy))))
        verts.append((tip, v_left))
    return tris


def tri_path(t):
    return f'M{pt(t[0])}L{pt(t[1])}L{pt(t[2])}Z'


def petal_path(cx, cy, r_in, r_out, half_w, deg):
    """Leaf shape along a radial axis, two cubic curves. Returns (d, anchors, controls, handles)."""
    base = polar(cx, cy, r_in, deg)
    tip = polar(cx, cy, r_out, deg)
    ax = (tip[0] - base[0], tip[1] - base[1])
    length = math.hypot(*ax)
    ux, uy = ax[0] / length, ax[1] / length
    nx, ny = -uy, ux
    c1 = (base[0] + ux * length * 0.18 + nx * half_w * 1.55, base[1] + uy * length * 0.18 + ny * half_w * 1.55)
    c2 = (base[0] + ux * length * 0.78 + nx * half_w * 0.9, base[1] + uy * length * 0.78 + ny * half_w * 0.9)
    c3 = (base[0] + ux * length * 0.78 - nx * half_w * 0.9, base[1] + uy * length * 0.78 - ny * half_w * 0.9)
    c4 = (base[0] + ux * length * 0.18 - nx * half_w * 1.55, base[1] + uy * length * 0.18 - ny * half_w * 1.55)
    d = f'M{pt(base)}C{pt(c1)} {pt(c2)} {pt(tip)}C{pt(c3)} {pt(c4)} {pt(base)}Z'
    handles = [(base[0], base[1], c1[0], c1[1]), (tip[0], tip[1], c2[0], c2[1]),
               (tip[0], tip[1], c3[0], c3[1]), (base[0], base[1], c4[0], c4[1])]
    return d, [base, tip], [c1, c2, c3, c4], handles


def build_emblem():
    cx = cy = 200
    anchors, controls, handles = [], [], []
    outline = []

    # rings (stroke centrelines)
    ring_defs = [(190, 7), (178, 2), (140, 2.5), (130, 1.2), (18, 3)]
    strokes = []
    for r, w in ring_defs:
        d, a, c, h = circle_path(cx, cy, r)
        strokes.append({'d': d, 'w': w})
        outline.append(d)
        anchors += a
        controls += c
        handles += h

    # ticks
    ticks = {'minor': [], 'mid': [], 'major': []}
    for i in range(72):
        deg = i * 5
        if deg % 90 == 0:
            kind, r0 = 'major', 144
        elif deg % 15 == 0:
            kind, r0 = 'mid', 152
        else:
            kind, r0 = 'minor', 158
        p0, p1 = polar(cx, cy, r0, deg), polar(cx, cy, 172, deg)
        ticks[kind].append(f'M{pt(p0)}L{pt(p1)}')
    tick_defs = [{'d': ''.join(ticks['minor']), 'w': 1.6}, {'d': ''.join(ticks['mid']), 'w': 2.4},
                 {'d': ''.join(ticks['major']), 'w': 4.2}]

    # secondary hairline rays
    rays = ''.join(f"M{pt(polar(cx, cy, 40, 22.5 + 45 * k))}L{pt(polar(cx, cy, 112, 22.5 + 45 * k))}" for k in range(8))
    ray_def = {'d': rays, 'w': 1.2}

    # star
    tris = star_triangles(cx, cy, 122, 84, 36)
    ink_tris, paper_tris = [], []
    star_outline = []
    for left, right in tris:
        ink_tris.append(tri_path(left))
        paper_tris.append(tri_path(right))
        for t in (left, right):
            star_outline.append(tri_path(t))
            anchors += [t[0], t[1]]
    outline += star_outline

    # petals on the diagonals (accent)
    accent_parts = []
    for k in range(4):
        deg = -45 + 90 * k
        d, a, c, h = petal_path(cx, cy, 92, 126, 9, deg)
        accent_parts.append(d)
        outline.append(d)
        anchors += a
        controls += c
        handles += h

    # north pointer (accent triangle on the ring)
    north = [(cx, cy - 150), (cx - 10, cy - 176), (cx + 10, cy - 176)]
    accent_parts.append(f'M{pt(north[0])}L{pt(north[1])}L{pt(north[2])}Z')
    outline.append(accent_parts[-1])
    anchors += north

    # centre
    accent_parts.append(circle_path(cx, cy, 9)[0])

    guides = (f'M{cx} 4V396M4 {cy}H396'
              f'M{pt(polar(cx, cy, 196, 45))}L{pt(polar(cx, cy, 196, 225))}'
              f'M{pt(polar(cx, cy, 196, 135))}L{pt(polar(cx, cy, 196, 315))}')
    guide_circles = [circle_path(cx, cy, 100)[0], circle_path(cx, cy, 160)[0]]

    return {
        'size': 400,
        'ink': ''.join(ink_tris),
        'paper': ''.join(paper_tris),
        'accent': ''.join(accent_parts),
        'strokes': strokes,
        'ticks': tick_defs,
        'rays': ray_def,
        'outline': ''.join(outline),
        'guides': guides,
        'guideCircles': guide_circles,
        'anchors': dedupe(anchors),
        'controls': dedupe(controls),
        'handles': handles,
    }


def build_mark():
    """Small star mark in a 64 x 64 box (no rings, no ticks)."""
    cx = cy = 32
    tris = star_triangles(cx, cy, 31, 21, 11)
    ink = ''.join(tri_path(l) for l, _ in tris)
    paper = ''.join(tri_path(r) for _, r in tris)
    accent = circle_path(cx, cy, 3.4)[0]
    return {'ink': ink, 'paper': paper, 'accent': accent}


# ---------------------------------------------------------------- defect samples (problem section)

def star_polygon(cx, cy, r_card, r_inter, r_valley, jitter=None, rng=None):
    """16 vertex star outline; optional radial/angular jitter makes an 'AI-drawn' asymmetric version."""
    pts = []
    for k in range(8):
        axis = -90 + 45 * k
        for deg, r in ((axis, r_card if k % 2 == 0 else r_inter), (axis + 22.5, r_valley)):
            if jitter and rng:
                r = r * (1 + rng.uniform(-jitter, jitter))
                deg = deg + rng.uniform(-jitter * 14, jitter * 14)
            pts.append(polar(cx, cy, r, deg))
    return pts


def inside_polygon(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def build_defects():
    import random
    rng = random.Random(11)

    # 1) low resolution: the emblem rasterised onto a 22 x 22 grid
    n = 22
    c = n / 2
    star = star_polygon(c, c, 8.2, 5.4, 2.5)
    cells = []
    for gy in range(n):
        for gx in range(n):
            x, y = gx + 0.5, gy + 0.5
            ring = abs(math.hypot(x - c, y - c) - 10.3) < 0.62
            if ring or inside_polygon(x, y, star):
                cells.append((gx, gy))
    pixels = ''.join(f'M{gx} {gy}h1v1h-1z' for gx, gy in cells)

    # 2) AI-drawn: wobbly star and ring, drawn in a 120 box, softened with a blur filter in the component
    ai_star = star_polygon(60, 60, 44, 29, 13, jitter=0.07, rng=rng)
    ai_d = 'M' + 'L'.join(pt(p) for p in ai_star) + 'Z'
    ring_pts = [polar(60, 60, 55 * (1 + rng.uniform(-0.035, 0.035)), 360 * i / 40 + rng.uniform(-2, 2)) for i in range(40)]
    ai_ring = 'M' + 'L'.join(pt(p) for p in ring_pts) + 'Z'

    # 3) auto-traced: jagged outline with a node on every wobble
    base = star_polygon(60, 60, 44, 29, 13)
    traced_pts = []
    for i in range(len(base)):
        a, b = base[i], base[(i + 1) % len(base)]
        for t in range(7):
            f = t / 7
            x, y = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
            traced_pts.append((x + rng.uniform(-1.5, 1.5), y + rng.uniform(-1.5, 1.5)))
    ring_traced = [polar(60, 60, 55 + rng.uniform(-1.6, 1.6), 360 * i / 72) for i in range(72)]
    traced_d = 'M' + 'L'.join(pt(p) for p in traced_pts) + 'Z'
    traced_ring_d = 'M' + 'L'.join(pt(p) for p in ring_traced) + 'Z'
    return {
        'pixelsSize': n,
        'pixels': pixels,
        'aiStar': ai_d,
        'aiRing': ai_ring,
        'tracedStar': traced_d,
        'tracedRing': traced_ring_d,
        'tracedNodes': dedupe(traced_pts + ring_traced),
    }


# ---------------------------------------------------------------- output

def ts_points(points, indent='  '):
    return '[' + ','.join(f'[{fmt(p[0])},{fmt(p[1])}]' for p in points) + ']'


def ts_handles(hs):
    return '[' + ','.join(f'[{fmt(h[0])},{fmt(h[1])},{fmt(h[2])},{fmt(h[3])}]' for h in hs) + ']'


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    wm = build_wordmark(sys.argv[1])
    em = build_emblem()
    mk = build_mark()
    df = build_defects()
    vb = wm['viewBox']
    lines = [
        '// Generated by scripts/brand/generate-brand-art.py. Do not edit by hand; rerun the script instead.',
        '// Wordmark outlines come from Bricolage Grotesque (SIL OFL 1.1); everything else is original geometry.',
        '',
        'export const WORDMARK = {',
        f"  viewBox: '{fmt(vb[0])} {fmt(vb[1])} {fmt(vb[2])} {fmt(vb[3])}',",
        f'  width: {fmt(vb[2])},',
        f'  height: {fmt(vb[3])},',
        f"  d: '{wm['d']}',",
        f"  dot: {{ x: {fmt(wm['dot'][0])}, y: {fmt(wm['dot'][1])}, size: {fmt(wm['dot'][2])} }},",
        f"  anchors: {ts_points(wm['anchors'])} as ReadonlyArray<readonly [number, number]>,",
        f"  controls: {ts_points(wm['controls'])} as ReadonlyArray<readonly [number, number]>,",
        f"  handles: {ts_handles(wm['handles'])} as ReadonlyArray<readonly [number, number, number, number]>,",
        '} as const;',
        '',
        'export const EMBLEM = {',
        f"  size: {em['size']},",
        f"  ink: '{em['ink']}',",
        f"  paper: '{em['paper']}',",
        f"  accent: '{em['accent']}',",
        '  strokes: [' + ','.join(f"{{ d: '{s['d']}', w: {fmt(s['w'])} }}" for s in em['strokes']) + '],',
        '  ticks: [' + ','.join(f"{{ d: '{s['d']}', w: {fmt(s['w'])} }}" for s in em['ticks']) + '],',
        f"  rays: {{ d: '{em['rays']['d']}', w: {fmt(em['rays']['w'])} }},",
        f"  outline: '{em['outline']}',",
        f"  guides: '{em['guides']}',",
        '  guideCircles: [' + ','.join(f"'{d}'" for d in em['guideCircles']) + '],',
        f"  anchors: {ts_points(em['anchors'])} as ReadonlyArray<readonly [number, number]>,",
        f"  controls: {ts_points(em['controls'])} as ReadonlyArray<readonly [number, number]>,",
        f"  handles: {ts_handles(em['handles'])} as ReadonlyArray<readonly [number, number, number, number]>,",
        '} as const;',
        '',
        'export const DEFECTS = {',
        f"  pixelsSize: {df['pixelsSize']},",
        f"  pixels: '{df['pixels']}',",
        f"  aiStar: '{df['aiStar']}',",
        f"  aiRing: '{df['aiRing']}',",
        f"  tracedStar: '{df['tracedStar']}',",
        f"  tracedRing: '{df['tracedRing']}',",
        f"  tracedNodes: {ts_points(df['tracedNodes'])} as ReadonlyArray<readonly [number, number]>,",
        '} as const;',
        '',
        'export const MARK = {',
        f"  ink: '{mk['ink']}',",
        f"  paper: '{mk['paper']}',",
        f"  accent: '{mk['accent']}',",
        '} as const;',
        '',
    ]
    OUT.write_text('\n'.join(lines))
    icon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="14" fill="#15171C"/>'
        '<g transform="translate(5 5) scale(.84375)" stroke="#15171C" stroke-width="1.4" stroke-linejoin="round">'
        f'<path d="{mk["ink"]}{mk["paper"]}" fill="#F4EFE5"/>'
        f'<path d="{mk["accent"]}" fill="#EB4A1E" stroke="none"/></g></svg>\n'
    )
    (OUT.parents[1] / 'app' / 'icon.svg').write_text(icon)
    print(f'wrote {OUT} ({OUT.stat().st_size} bytes); wordmark viewBox {vb}, {len(wm["anchors"])} anchors')


if __name__ == '__main__':
    main()
