"""WCAG 2.1 contrast ratios for every text/background pair used in the template."""
def L(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def cr(a, b): la, lb = sorted([L(a), L(b)], reverse=True); return (la + 0.05) / (lb + 0.05)
pairs = [  # (fg, bg, usage, large_text?)
 ('#1B2A41', '#F4F0E6', 'ink text on paper', False), ('#3A4659', '#F4F0E6', 'secondary text / sources on paper', False),
 ('#1B2A41', '#FBF8F1', 'ink text on cards', False), ('#FFFFFF', '#1B2A41', 'subtitles (white on navy)', False),
 ('#F4F0E6', '#1B2A41', 'solid tag', False), ('#1B2A41', '#E0B33A', 'ink on gold (stamp, highlighter)', False),
 ('#2F5DA8', '#F4F0E6', 'Democratic seat label (≥26px bold)', True), ('#C8423B', '#F4F0E6', 'Republican seat label (≥26px bold)', True),
 ('#FFFFFF', '#2F5DA8', 'chip text on Dem blue (28px bold)', True), ('#FFFFFF', '#C8423B', 'chip text on Rep red (28px bold)', True),
 ('#3A4659', '#FBF8F1', 'secondary text on cards', False)]
ok = True
for fg, bg, u, large in pairs:
    r = cr(fg, bg); need = 3.0 if large else 4.5; ok &= r >= need
    print(f'{r:5.2f}:1  need {need}  {"PASS" if r >= need else "FAIL"}  {u}')
print('relative luminance  Dem', round(L('#2F5DA8'), 3), ' Rep', round(L('#C8423B'), 3))
print('ALL PASS' if ok else 'SOME FAIL')
