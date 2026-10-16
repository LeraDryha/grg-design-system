# Splits a whole-set Figma SVG export (Coin, Payment method icon, Country icons) into one SVG per icon.
# Each icon is its <g id="<Figma name>"> group, cut out at its position in the set (figma/icon-positions.json,
# read from Figma: name, x, y, width, height). The result is figma/<kind>-icons.json; then run `npm run icons`.
# Sets with hundreds of icons are too big to export one by one, hence the whole-set export.
#
#   python3 scripts/split-figma-export.py <export.svg> coin|payment|country figma/icon-positions.json figma/<kind>-icons.json <offsetX> <offsetY>
#
# The offset is where the set starts inside the export: 0 0 for a component set, 52 28 for the Country icons frame (its shadow).
import json, re, sys
import xml.etree.ElementTree as ET
svg_path, kind, pos_path, out_path, ox, oy = sys.argv[1:7]
ox, oy = float(ox), float(oy)
SVG = 'http://www.w3.org/2000/svg'; XL = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', SVG); ET.register_namespace('xlink', XL)
root = ET.parse(svg_path).getroot()
parent = {c: p for p in root.iter() for c in p}
defs = {}
for d in root.iter(f'{{{SVG}}}defs'):
    for el in d:
        if el.get('id'): defs[el.get('id')] = el
items = json.load(open(pos_path))[kind]
prefix = {'coin': 'Name=', 'payment': 'Payment method=', 'country': ''}[kind]
groups = [g for g in root.iter(f'{{{SVG}}}g') if g.get('id') and parent.get(g) is not None]
# The variant groups are the direct children of the set group (coins, payment) or of the frame (countries)
host = {'coin': 'Coin', 'payment': 'Payment method icon', 'country': 'Country icons'}[kind]
hostg = next(g for g in root.iter(f'{{{SVG}}}g') if g.get('id') in (host, host + ' icon'))
cands = [g for g in hostg.iter(f'{{{SVG}}}g') if g.get('id')]
base = lambda i: re.sub(r'_\d+$', '', i)
names = [prefix + it[0] for it in items]
pool = {}
for g in cands:
    pool.setdefault(base(g.get('id')), []).append(g)
# ancestors with transforms would shift coordinates
def has_transform(g):
    p = parent.get(g)
    while p is not None:
        if p.get('transform'): return True
        p = parent.get(p)
    return False
rnd = lambda s: re.sub(r'(\d+\.\d{2})\d+', r'\1', s)
out, missing = {}, []
for (name, x, y, w, h) in items:
    key = prefix + name
    lst = pool.get(key) or pool.get(key.replace('/', '_'))
    if not lst: missing.append(name); continue
    g = lst.pop(0)
    if has_transform(g): raise SystemExit(f'transform above {name}')
    # collect referenced defs, recursively
    need, todo = [], [g]
    while todo:
        el = todo.pop()
        s = ET.tostring(el, encoding='unicode')
        for ref in re.findall(r'url\(#([^)]+)\)|href="#([^"]+)"', s):
            r = ref[0] or ref[1]
            if r in defs and defs[r] not in need:
                need.append(defs[r]); todo.append(defs[r])
    body = ET.tostring(g, encoding='unicode')
    d = ''.join(ET.tostring(e, encoding='unicode') for e in need)
    body = re.sub(r'\s(?:data-name|id)="(?![a-z]+\d*_)[^"]*"', '', body)  # layer names only; def ids look like clip0_1_2
    body = re.sub(r' xmlns(:xlink)?="[^"]+"', '', body)
    d = re.sub(r' xmlns(:xlink)?="[^"]+"', '', d)
    vx, vy = x + ox, y + oy
    xl = ' xmlns:xlink="http://www.w3.org/1999/xlink"' if 'xlink:' in body + d else ''
    svg = f'<svg xmlns="http://www.w3.org/2000/svg"{xl} width="{w}" height="{h}" viewBox="{vx:g} {vy:g} {w} {h}" fill="none">{body}' + (f'<defs>{d}</defs>' if d else '') + '</svg>'
    out.setdefault(name, []).append(rnd(re.sub(r'\n\s*', '', svg)))
node = {'coin': 'Coin (80:4965)', 'payment': 'Payment method icon (80:15178)', 'country': 'Country icons frame (68:14967)'}[kind]
source = f'Figma GRG Design System, {node}: the whole set exported as SVG and split per variant by scripts/split-figma-export.py. Numbers rounded to 0.01. A name with two or more entries has duplicates in Figma.'
with open(out_path, 'w') as f:
    f.write('{\n"source": ' + json.dumps(source) + ',\n"icons": {\n' + ',\n'.join(json.dumps(n) + ': ' + json.dumps(v) for n, v in out.items()) + '\n}\n}\n')
left = sum(len(v) for v in pool.values() if v)
print(kind, 'variants', sum(len(v) for v in out.values()), 'missing', missing, 'unused groups', left, [k for k, v in pool.items() if v][:10])
