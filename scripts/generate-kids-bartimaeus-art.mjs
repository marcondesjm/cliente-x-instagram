import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = 'docs/illustrations/sabedoria-kids/bartimaeus-healing';
const colors = {
  ink: '#302449',
  purple: '#7354a3',
  robe: '#efb54b',
  teal: '#398b83',
  skin: '#c98258',
  skinLight: '#e2a77b',
  cream: '#fff8e9',
  hill: '#9bc48f',
  hillDark: '#6e9b76',
  road: '#d9b987',
  blue: '#a8d8e7',
  white: '#fffdf5'
};

function person({ x, y, scale = 1, robe = colors.purple, cloak = colors.robe, seated = false, walking = false, eyesOpen = true, staff = false, arm = 'down', facing = 1, jesus = false }) {
  const transform = `translate(${x} ${y}) scale(${scale * facing} ${scale})`;
  const legs = seated
    ? `<path d="M-14 46 Q-25 61 -8 67 L13 63 Q23 59 13 52" fill="${colors.robe}" stroke="${colors.ink}" stroke-width="3"/><path d="M8 48 Q35 57 36 69 L9 69" fill="${colors.robe}" stroke="${colors.ink}" stroke-width="3"/>`
    : walking
      ? `<path d="M-9 39 L-15 69 L-29 81 M8 39 L19 62 L35 71" fill="none" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/><path d="M-31 81 h12 M31 71 h12" stroke="${colors.ink}" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="M-9 39 L-12 73 M9 39 L13 73" fill="none" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/><path d="M-21 74 h17 M5 74 h17" stroke="${colors.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const raisedArm = arm === 'raised'
    ? `<path d="M-17 0 Q-34 -12 -29 -39" fill="none" stroke="${colors.skin}" stroke-width="8" stroke-linecap="round"/><circle cx="-29" cy="-42" r="5" fill="${colors.skin}"/>`
    : arm === 'open'
      ? `<path d="M-17 0 Q-39 -2 -47 -19 M17 0 Q38 4 44 -13" fill="none" stroke="${colors.skin}" stroke-width="8" stroke-linecap="round"/>`
      : `<path d="M-17 0 Q-26 18 -22 35 M17 0 Q27 18 23 35" fill="none" stroke="${colors.skin}" stroke-width="8" stroke-linecap="round"/>`;
  const stick = staff ? `<path d="M35 -15 Q53 -18 53 -4 L53 77" fill="none" stroke="#75523a" stroke-width="5" stroke-linecap="round"/>` : '';
  return `<g transform="${transform}">
    ${jesus ? '<ellipse cx="0" cy="-42" rx="31" ry="8" fill="#ffe58a" stroke="#d49a36" stroke-width="2"/><path d="M0 -54v24 M-10 -42h20" stroke="#fff8db" stroke-width="3" stroke-linecap="round"/>' : ''}
    ${stick}${legs}
    <path d="M-22 -1 Q-25 21 -17 46 Q0 54 19 46 Q24 21 20 -1 Q0 -12 -22 -1Z" fill="${robe}" stroke="${colors.ink}" stroke-width="3"/>
    ${jesus ? '<path d="M-17 4 L16 39" stroke="#b94d45" stroke-width="7" opacity=".95"/>' : ''}
    <path d="M-18 3 Q-37 -5 -39 11 L-29 29" fill="none" stroke="${colors.skin}" stroke-width="8" stroke-linecap="round"/>
    ${raisedArm}
    <path d="M-18 -35 Q-20 -57 0 -60 Q20 -56 18 -34 L15 -12 Q0 1 -15 -12Z" fill="${colors.skinLight}" stroke="${colors.ink}" stroke-width="3"/>
    <path d="M-20 -35 Q-18 -67 12 -64 Q27 -59 19 -34 Q9 -45 -8 -42 Q-12 -33 -20 -35Z" fill="${cloak}" stroke="${colors.ink}" stroke-width="3"/>
    ${jesus ? '<path d="M-13 -21 Q0 -11 13 -21 L12 -5 Q0 7 -12 -5Z" fill="#76513e" stroke="#604132" stroke-width="2"/>' : ''}
    ${eyesOpen ? '<circle cx="6" cy="-31" r="2.4" fill="#302449"/>' : '<path d="M1 -31 q5 4 10 0" fill="none" stroke="#302449" stroke-width="2.5" stroke-linecap="round"/>'}
    <path d="M7 -22 q5 3 9 -1" fill="none" stroke="#8c4e46" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;
}

function background({ width = 1080, height = 1350, warm = false } = {}) {
  const ground = height * (height > 1500 ? 0.55 : 0.46);
  return `<defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${warm ? '#ffe2a7' : colors.blue}"/><stop offset="1" stop-color="${colors.cream}"/></linearGradient>
    <linearGradient id="road" x2="0" y2="1"><stop stop-color="#e9d2a8"/><stop offset="1" stop-color="${colors.road}"/></linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <circle cx="${width * .82}" cy="${height * .16}" r="64" fill="#fff1bf" opacity=".8"/>
  <path d="M0 ${ground + 20} Q180 ${ground - 100} 360 ${ground + 18} T720 ${ground + 4} T1080 ${ground - 20} V${height} H0Z" fill="${colors.hill}"/>
  <path d="M0 ${ground + 85} Q260 ${ground - 8} 510 ${ground + 90} T1080 ${ground + 48} V${height} H0Z" fill="${colors.hillDark}" opacity=".72"/>
  <path d="M${width * .43} ${ground - 15} Q${width * .31} ${height * .83} ${width * .23} ${height} H${width * .88} Q${width * .67} ${height * .81} ${width * .59} ${ground - 8}Z" fill="url(#road)"/>
  <path d="M${width * .5} ${ground + 45} Q${width * .52} ${height * .8} ${width * .55} ${height}" fill="none" stroke="#f7ebd4" stroke-width="7" stroke-dasharray="18 22" opacity=".55"/>
  <g fill="#8b6549" opacity=".86">
    <path d="M65 ${ground + 8} v-130 h95 v130z"/><path d="M170 ${ground + 4} v-178 h118 v178z"/><path d="M302 ${ground + 6} v-114 h86 v114z"/>
  </g>
  <g fill="#f5d89c" opacity=".86">${Array.from({ length: 12 }, (_, i) => `<rect x="${80 + (i % 4) * 50}" y="${ground - 100 + Math.floor(i / 4) * 45}" width="16" height="21" rx="3"/>`).join('')}</g>
  <path d="M0 ${ground + 15} H1080" stroke="#769b6d" stroke-width="6" opacity=".5"/>`;
}

function svgScene({ name, title, beat, width = 1080, height = 1350, warm = false }) {
  const ground = height * (height > 1500 ? .55 : .46);
  let foreground = '';
  if (beat === 'cover') {
    foreground = `${person({ x: 700, y: ground + 120, scale: 1.8, robe: '#567ca3', cloak: '#c78359', seated: true, eyesOpen: false, staff: true, arm: 'down', facing: -1 })}
      ${person({ x: 275, y: ground + 20, scale: 1.15, robe: '#fff4dc', cloak: '#c78359', walking: true, arm: 'open', jesus: true })}
      ${person({ x: 150, y: ground + 22, scale: .78, robe: colors.purple, cloak: '#d98f57', walking: true })}
      <path d="M680 ${ground + 178} q46 18 96 0" fill="none" stroke="#75523a" stroke-width="9" stroke-linecap="round"/>`;
  } else if (beat === 'hears') {
    foreground = `${person({ x: 690, y: ground + 145, scale: 1.7, robe: '#567ca3', cloak: '#c78359', seated: true, eyesOpen: false, staff: true, arm: 'raised', facing: -1 })}
      ${person({ x: 270, y: ground + 15, scale: 1.1, robe: '#fff4dc', cloak: '#c78359', walking: true, arm: 'open', jesus: true })}
      ${person({ x: 420, y: ground + 5, scale: .92, robe: colors.purple, cloak: '#d98f57', walking: true })}
      ${person({ x: 530, y: ground + 25, scale: .85, robe: '#bb654f', cloak: '#f1cd77', walking: true })}
      <path d="M732 ${ground + 66} q35 -38 2 -68 M747 ${ground + 75} q57 -60 7 -110" fill="none" stroke="#d78d51" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
  } else if (beat === 'calls') {
    foreground = `${person({ x: 720, y: ground + 145, scale: 1.7, robe: '#567ca3', cloak: '#c78359', seated: true, eyesOpen: false, staff: true, arm: 'raised', facing: -1 })}
      ${person({ x: 310, y: ground + 18, scale: 1.12, robe: '#fff4dc', cloak: '#c78359', walking: true, jesus: true })}
      ${person({ x: 460, y: ground + 8, scale: .95, robe: colors.purple, cloak: '#d98f57', walking: true })}
      <path d="M675 ${ground + 40} q28 -36 57 0" fill="none" stroke="#c47c52" stroke-width="8" stroke-linecap="round"/>`;
  } else if (beat === 'called') {
    foreground = `${person({ x: 700, y: ground + 100, scale: 1.35, robe: '#567ca3', cloak: '#c78359', seated: true, eyesOpen: false, staff: true, arm: 'open', facing: -1 })}
      ${person({ x: 365, y: ground + 12, scale: 1.28, robe: '#fff4dc', cloak: '#c78359', walking: true, arm: 'open', jesus: true })}
      ${person({ x: 520, y: ground + 18, scale: .95, robe: colors.purple, cloak: '#d98f57', walking: true })}
      ${person({ x: 860, y: ground + 35, scale: .8, robe: '#bd704b', cloak: '#f0c96b', arm: 'open' })}
      <path d="M624 ${ground + 85} q18 -40 49 -12" fill="none" stroke="#d78d51" stroke-width="8" stroke-linecap="round"/>`;
  } else if (beat === 'healed') {
    foreground = `<circle cx="565" cy="${ground + 32}" r="170" fill="#fff4c5" opacity=".38" filter="url(#soft)"/>
      ${person({ x: 565, y: ground + 65, scale: 1.5, robe: '#fff4dc', cloak: '#c78359', walking: true, eyesOpen: true, arm: 'open', jesus: true })}
      ${person({ x: 770, y: ground + 70, scale: 1.35, robe: colors.teal, cloak: colors.cream, walking: true, eyesOpen: true, arm: 'open' })}
      ${person({ x: 390, y: ground + 40, scale: .95, robe: colors.purple, cloak: '#d98f57', walking: true, arm: 'open' })}
      <g fill="#fff4c5" opacity=".9"><path d="M468 ${ground - 105} l12 -28 9 30 26 -18 -12 29 32 5 -31 11 13 25 -28 -17 -14 26 -2 -32 -29 -4 28 -12z"/><circle cx="478" cy="${ground - 36}" r="8"/><circle cx="855" cy="${ground - 77}" r="10"/></g>`;
  } else {
    foreground = `${person({ x: 430, y: ground + 50, scale: 1.45, robe: '#fff4dc', cloak: '#c78359', walking: true, eyesOpen: true, arm: 'open', jesus: true })}
      ${person({ x: 645, y: ground + 50, scale: 1.35, robe: colors.teal, cloak: colors.cream, walking: true, eyesOpen: true, arm: 'open' })}
      ${person({ x: 820, y: ground + 45, scale: .93, robe: colors.purple, cloak: '#d98f57', walking: true })}
      <path d="M325 ${ground + 133} q120 55 280 8" fill="none" stroke="#efdcad" stroke-width="12" stroke-linecap="round"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
    ${background({ width, height, warm })}
    <g opacity=".18" fill="${colors.white}" filter="url(#soft)"><ellipse cx="230" cy="${ground - 150}" rx="155" ry="60"/><ellipse cx="700" cy="${ground - 180}" rx="185" ry="70"/></g>
    ${foreground}
    <g fill="#496d55" opacity=".8"><circle cx="120" cy="${ground + 42}" r="20"/><circle cx="965" cy="${ground + 30}" r="26"/><path d="M120 ${ground + 42} v65 M965 ${ground + 30} v68" stroke="#6e5941" stroke-width="10"/></g>
    <rect x="22" y="22" width="${width - 44}" height="${height - 44}" rx="48" fill="none" stroke="#fffaf0" stroke-width="10" opacity=".7"/>
  </svg>`;
}

const scenes = [
  ['01-cover', 'Bartimeu chamou por Jesus', 'cover', false],
  ['02-hears', 'Bartimeu ouviu que Jesus passava', 'hears', false],
  ['03-calls', 'Bartimeu chamou com coragem', 'calls', false],
  ['04-called', 'Jesus parou e pediu que o chamassem', 'called', true],
  ['05-healed', 'Bartimeu voltou a enxergar', 'healed', true],
  ['06-story', 'Bartimeu seguiu pelo caminho com Jesus', 'walks', true]
];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const [name, title, beat, warm] of scenes) {
    const height = 675;
    const svg = svgScene({ name, title, beat, height, warm }).replace(/[ \t]+$/gm, '');
    const svgPath = resolve(root, output, `${name}.svg`);
    const pngPath = resolve(root, output, `${name}.png`);
    await mkdir(dirname(svgPath), { recursive: true });
    await writeFile(svgPath, svg, 'utf8');
    await page.setViewportSize({ width: 1080, height });
    await page.setContent(svg, { waitUntil: 'load' });
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Gerado: ${pngPath}`);
  }
} finally {
  await browser.close();
}
