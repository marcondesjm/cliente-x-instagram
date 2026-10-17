import { normalizeBriefing } from './briefing-data.js';
import { MAX_LOGO_BYTES, normalizeBriefingLogo } from './briefing-logo.js';
let logoAttachment = null;
let logoRead = Promise.resolve();
let logoError = '';
const logoFile = document.getElementById('logoFile');
const logoStatus = document.getElementById('logoStatus');
const preview = document.getElementById('logoPreview');
const removeLogo = document.getElementById('removeLogo');
function clearLogo() {
  logoAttachment = null;
  logoError = '';
  preview.hidden = true;
  preview.removeAttribute('src');
  removeLogo.hidden = true;
  logoStatus.textContent = '';
}
logoFile.addEventListener('change', () => {
  clearLogo();
  const file = logoFile.files[0];
  logoRead = (async () => {
    if (!file) return;
    try {
      if (file.size > MAX_LOGO_BYTES) throw new Error('O logotipo deve ter no máximo 1 MB.');
      if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Use logotipo PNG, JPG ou WebP.');
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem. Selecione o arquivo novamente.'));
        reader.readAsDataURL(file);
      });
      // Validate that the image decodes before keeping it in the briefing.
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      if (file !== logoFile.files[0]) return;
      logoAttachment = normalizeBriefingLogo({ name: file.name, dataUrl });
      preview.src = logoAttachment.dataUrl;
      preview.hidden = false;
      removeLogo.hidden = false;
      logoStatus.textContent = `Logotipo anexado: ${logoAttachment.name}`;
    } catch (error) {
      if (file !== logoFile.files[0]) return;
      clearLogo();
      logoError = error.message;
      logoStatus.textContent = logoError;
      removeLogo.hidden = false;
    }
  })();
});
removeLogo.addEventListener('click', () => { logoFile.value = ''; clearLogo(); });
document.getElementById('briefingForm').addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.getElementById('status');
  try {
    await logoRead;
    if (logoError) throw new Error(logoError + ' Remova o anexo ou escolha outra imagem.');
    const fields = new FormData(event.target);
    const data = normalizeBriefing({ ...Object.fromEntries(fields), logoAttachment, formats: fields.getAll('formats'), schema: 'instagram-client-briefing', version: 1 });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `briefing-${data.username}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status.textContent = 'Briefing preparado para download. Envie o arquivo briefing-' + data.username + '.json ao responsável pelo seu cadastro. O envio não é automático.';
  } catch (error) { status.textContent = error.message; }
});
