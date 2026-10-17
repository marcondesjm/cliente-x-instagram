export const MAX_LOGO_BYTES = 1024 * 1024;

export function normalizeBriefingLogo(input) {
  if (input == null) return null;
  if (!input || typeof input !== 'object') throw new Error('Logotipo anexado inválido.');
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(input.dataUrl || ''));
  if (!match || match[2].length % 4 !== 0) throw new Error('Use logotipo PNG, JPG ou WebP.');
  const bytes = match[2].length * 3 / 4 - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0);
  if (bytes > MAX_LOGO_BYTES) throw new Error('O logotipo deve ter no máximo 1 MB.');
  const signatures = { png: 'iVBORw0KGgo', jpeg: '/9j/', webp: 'UklGR' };
  if (!match[2].startsWith(signatures[match[1]]) || bytes < 12) throw new Error('O conteúdo do logotipo não corresponde ao formato informado.');
  // WebP uses a RIFF header followed by the WEBP identifier at bytes 8–11.
  if (match[1] === 'webp' && atob(match[2].slice(0, 32)).slice(8, 12) !== 'WEBP') throw new Error('Arquivo WebP inválido.');
  const name = String(input.name || 'logotipo').replace(/[\x00-\x1f\\/<>]/g, '').slice(0, 160) || 'logotipo';
  return { name, type: `image/${match[1]}`, dataUrl: `data:image/${match[1]};base64,${match[2]}` };
}
