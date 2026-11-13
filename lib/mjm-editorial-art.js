const asset = (name) => new URL(`./assets/mjm-digital/${name}`, import.meta.url).href;

export const MJM_EDITORIAL_PALETTE = {
  primary: '#08201A',
  secondary: '#CAA14F',
  background: '#08201A',
  text: '#C9CBCB',
  card: '#253530'
};

export function usesMjmEditorialArt(account = {}) {
  return account.account === 'cliente-x' && account.brandPalette?.template === 'mjm-digital'
    && account.brandPalette.enabled;
}

export function mjmEditorialHtml({ title, eyebrow, body, source, image, index, total, height, story = false, reel = false, feedContinuation = true, escape }) {
  const { background, secondary: gold, text, card } = MJM_EDITORIAL_PALETTE;
  const top = story || reel ? 258 : 66;
  const bottom = story ? 518 : reel ? 310 : 60;
  const sectionLabel = eyebrow?.replace(/\s*·\s*\d+\/\d+$/u, '');
  const sourceInLabel = source && sectionLabel?.toLowerCase().includes(source.toLowerCase());
  const imageBlock = image ? '<div class="context-photo" role="img" aria-label="Imagem da pauta"></div>' : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <style>
    @font-face {
      font-family: "Bricolage Grotesque";
      src: url("${asset('BricolageGrotesque.woff2')}") format("woff2");
      font-weight: 400 600;
    }
    @font-face {
      font-family: "Instrument Serif";
      src: url("${asset('InstrumentSerif-Italic.woff2')}") format("woff2");
      font-weight: 400;
      font-style: italic;
    }
    * { box-sizing: border-box; }
    body { margin: 0; width: 1080px; height: ${height}px; background: ${background}; color: ${text};
      font: 400 40px/1.24 "Bricolage Grotesque", sans-serif; overflow: hidden; }
    main { height: 100%; padding: ${top}px 76px ${bottom}px; display: flex; flex-direction: column; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 24px;
      padding-bottom: 24px; border-bottom: 2px solid ${gold}; }
    header img { display: block; width: 182px; height: auto; }
    header em { color: ${gold}; font: italic 400 42px/1 "Instrument Serif", serif; }
    article { display: flex; flex-direction: column; min-height: 0; flex: 1; gap: 22px; padding: 38px 0 26px; }
    article:not(:has(.context-photo)) { justify-content: center; }
    .topic { color: ${gold}; font-size: 26px; line-height: 1.14; font-weight: 600; letter-spacing: .055em; text-transform: uppercase; }
    h1 { margin: 0; font-size: ${String(title).length > 110 ? 65 : 78}px; line-height: 1.02;
      letter-spacing: -.035em; font-weight: 500; overflow-wrap: anywhere; }
    .context-photo { min-height: 155px; max-height: 555px; flex: 1 1 555px; border-radius: 22px;
      background: ${card} ${image || 'none'} center / ${source ? 'contain' : 'cover'} no-repeat; }
    .note { margin: 0; padding: 29px 34px; background: ${card}; border-radius: 18px;
      border-left: 5px solid ${gold}; font-size: ${String(body).length > 320 ? 39 : 45}px; line-height: 1.24;
      white-space: pre-line; overflow-wrap: anywhere; }
    .context-photo + .note { font-size: ${String(body).length > 250 ? 32 : 36}px; }
    footer { display: flex; justify-content: space-between; gap: 22px; align-items: baseline;
      padding-top: 19px; border-top: 1px solid ${gold}; font-size: 26px; line-height: 1.15; }
    footer span:last-child { font-weight: 600; color: ${gold}; }
  </style>
</head>
<body>
  <main class="mjm-editorial">
    <header><img src="${asset('logo.png')}" alt="MJM Digital"><em>IA aplicada a empresas</em></header>
    <article>
      ${sectionLabel ? `<div class="topic">${escape(sectionLabel)}</div>` : ''}
      <h1 class="headline">${escape(title)}</h1>
      ${imageBlock}
      ${body ? `<p class="note">${escape(body)}</p>` : ''}
    </article>
    <footer>
      <span>${source && !sourceInLabel ? `Fonte · ${escape(source)}` : (!story && !reel && index === 1 ? 'Arraste para ver' : '')}</span>
      <span>${story ? (feedContinuation ? 'Veja o conteúdo completo no feed' : '') : `${index}/${total}`}</span>
    </footer>
  </main>
</body>
</html>`;
}
