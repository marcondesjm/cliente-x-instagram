import { normalizeBriefing } from './briefing-data.js';
document.getElementById('briefingForm').addEventListener('submit', event => {
  event.preventDefault();
  const status = document.getElementById('status');
  try {
    const data = normalizeBriefing({ ...Object.fromEntries(new FormData(event.target)), schema: 'instagram-client-briefing', version: 1 });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `briefing-${data.username}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status.textContent = 'Briefing preparado para download. Envie o arquivo briefing-' + data.username + '.json ao responsável pelo seu cadastro. O envio não é automático.';
  } catch (error) { status.textContent = error.message; }
});
