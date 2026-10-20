import { normalizeBriefing } from './briefing-data.js';
import { MAX_LOGO_BYTES, normalizeBriefingLogo } from './briefing-logo.js';
let logoAttachment = null;
let logoRead = Promise.resolve();
let logoError = '';
const logoFile = document.getElementById('logoFile');
const logoStatus = document.getElementById('logoStatus');
const preview = document.getElementById('logoPreview');
const removeLogo = document.getElementById('removeLogo');
const form = document.getElementById('briefingForm');
const status = document.getElementById('status');
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
form.addEventListener('invalid', event => {
  const field = event.target;
  if (field.name === 'logo') {
    status.textContent = 'O link do logotipo é opcional. Deixe o campo vazio ou informe um endereço HTTPS válido.';
    return;
  }
  const label = field.labels?.[0]?.textContent.replace(/\s+/g, ' ').trim();
  status.textContent = label
    ? `Confira o campo “${label}”: ${field.validationMessage}`
    : `Confira os campos obrigatórios: ${field.validationMessage || 'preencha os dados marcados com *.'}`;
}, true);
form.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await logoRead;
    if (logoError) throw new Error(logoError + ' Remova o anexo ou escolha outra imagem.');
    const fields = new FormData(event.target);
    const data = normalizeBriefing({ ...Object.fromEntries(fields), logoAttachment, formats: fields.getAll('formats'), schema: 'instagram-client-briefing', version: 1 });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `briefing-${data.username}.json`;
    link.textContent = 'Toque aqui para baixar o briefing';
    link.setAttribute('role', 'button');
    link.style.cssText = 'display:inline-block;margin-top:12px;padding:14px 22px;background:#0e7c5a;color:#fff;font-weight:700;border-radius:9px;text-decoration:none';
    link.addEventListener('click', () => {
      status.firstChild.textContent = 'Se o arquivo abrir em uma nova tela, use Compartilhar e escolha Salvar em Arquivos ou Baixar. Depois, envie para marcondesgestaotrafego@gmail.com. ';
      // Keep the object URL alive for browsers that open the JSON instead of downloading it.
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    }, { once: true });
    status.replaceChildren(document.createTextNode('O briefing está pronto. Se o download não começar, toque no botão abaixo. O envio não é automático.'), document.createElement('br'), link);
    link.click();
  } catch (error) {
    status.textContent = `Não foi possível preparar o briefing: ${error.message || 'erro inesperado.'} Revise os campos e tente novamente.`;
    status.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
});
