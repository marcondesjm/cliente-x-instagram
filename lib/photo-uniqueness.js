import { pathToFileURL } from 'node:url';

export function similarPhoto(a, b) {
  if (!a || !b || a.length !== 256 || b.length !== 256) return false;
  return [...a].reduce((distance, bit, index) => distance + (bit !== b[index] ? 1 : 0), 0) <= 48;
}

export function photoIdentity(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.pathname = url.pathname.replace(/\.(jpg|png)\.(?:small|medium|large)(?:_2x)?\.(jpg|png)$/i, '.$1')
      .replace(/-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i, '');
    for (const key of ['w', 'h', 'width', 'height', 'quality', 'q', 'resize']) url.searchParams.delete(key);
    return url.href;
  } catch { return value; }
}

export async function photoSignature(page, path) {
  await page.goto(path.startsWith('file:') ? path : pathToFileURL(path).href);
  return page.evaluate(async () => {
    const image = document.querySelector('img');
    if (!image) throw new Error('Arquivo não contém uma imagem decodificável.');
    await image.decode();
    if (image.naturalWidth < 600 || image.naturalHeight < 300) throw new Error('Foto abaixo de 600 x 300 pixels.');
    const canvas = document.createElement('canvas'); canvas.width = 17; canvas.height = 16;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0, 17, 16);
    const pixels = context.getImageData(0, 0, 17, 16).data;
    const gray = index => pixels[index] * .299 + pixels[index + 1] * .587 + pixels[index + 2] * .114;
    let hash = '';
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const index = (y * 17 + x) * 4;
      hash += gray(index) > gray(index + 4) ? '1' : '0';
    }
    return hash;
  });
}
