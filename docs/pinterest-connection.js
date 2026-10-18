const endpoint = '/api/state?pinterest=1';
const section = document.querySelector('#pinterest-connection');

if (section) {
  const find = id => section.querySelector('#pinterest-' + id);
  const controls = {
    status: find('status'), refresh: find('refresh'), connect: find('connect'),
    disconnect: find('disconnect'), setup: find('setup'), missing: find('missing'),
    redirect: find('redirect'), browse: find('browse'), boards: find('boards'),
    loadBoards: find('load-boards'), nextBoards: find('next-boards'), loadPins: find('load-pins'),
    pins: find('pins'), next: find('next')
  };
  let configured = false;
  let connected = false;
  let busy = false;
  let nextBookmark = '';
  let boardsBookmark = '';
  let activeBoard = '';
  const callbackMessages = Object.freeze({
    configuration_required: 'A autorização não foi concluída: o aplicativo Pinterest precisa ser configurado no servidor.',
    invalid_state: 'A autorização expirou ou não corresponde a este navegador. Inicie a conexão novamente nesta página.',
    denied: 'A autorização do aplicativo foi recusada no Pinterest. Você pode iniciar a conexão novamente.',
    invalid_code: 'O Pinterest não retornou um código de autorização válido. Inicie a conexão novamente.',
    exchange_failed: 'Não foi possível concluir a troca da autorização com o Pinterest. Verifique o aplicativo e tente conectar novamente.'
  });
  const callbackResult = new URLSearchParams(window.location.search).get('pinterest');

  function updateButtons() {
    controls.refresh.disabled = busy;
    controls.connect.disabled = busy || !configured || connected;
    controls.disconnect.disabled = busy;
    controls.loadBoards.disabled = busy || !connected;
    controls.nextBoards.disabled = busy || !connected || !boardsBookmark;
    controls.boards.disabled = busy || !connected;
    controls.loadPins.disabled = busy || !connected || !/^\d+$/.test(controls.boards.value);
    controls.next.disabled = busy || !nextBookmark;
  }

  async function request(params = {}, body) {
    const url = new URL(endpoint, window.location.origin);
    for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET', cache: 'no-store', credentials: 'same-origin',
      ...(body ? {headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)} : {})
    });
    const data = await response.json().catch(() => ({}));
    if (data.connected === false) showConnection(data);
    if (response.status === 401) {
      showConnection({configured: false, connected: false, missing: []});
    }
    if (!response.ok || data.error) throw new Error(data.error || 'Não foi possível consultar o Pinterest.');
    return data;
  }

  async function run(message, task) {
    if (busy) return;
    busy = true;
    section.setAttribute('aria-busy', 'true');
    controls.status.textContent = message;
    updateButtons();
    try { await task(); }
    catch (error) { controls.status.textContent = error.message || 'Não foi possível consultar o Pinterest.'; }
    finally { busy = false; section.removeAttribute('aria-busy'); updateButtons(); }
  }

  function resetPins() {
    controls.pins.replaceChildren();
    nextBookmark = '';
    activeBoard = '';
    controls.next.hidden = true;
  }

  function showConnection(data) {
    configured = data.configured === true;
    connected = data.connected === true;
    controls.connect.hidden = connected;
    controls.disconnect.hidden = !connected;
    controls.setup.hidden = configured;
    controls.browse.hidden = !connected;
    controls.redirect.textContent = typeof data.redirectUri === 'string' ? data.redirectUri : 'Consulte o guia de conexão.';
    controls.missing.textContent = Array.isArray(data.missing) && data.missing.length
      ? 'Configuração pendente: ' + data.missing.join(', ') + '.' : '';
    const username = typeof data.profile?.username === 'string' ? data.profile.username : '';
    controls.status.textContent = connected
      ? 'Pinterest conectado' + (username ? ' · @' + username.replace(/^@/, '') : '') + '. Consulta ao vivo disponível.'
      : configured ? 'Conexão oficial disponível. Autorize sua conta no Pinterest para consultar suas pastas.'
        : 'A conexão oficial aguarda a configuração do aplicativo Pinterest no servidor.';
    if (!connected) {
      resetPins();
      boardsBookmark = '';
      controls.nextBoards.hidden = true;
      controls.boards.replaceChildren(new Option('Carregue suas pastas', ''));
    }
  }

  function safeUrl(value, kind) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return '';
      if (kind === 'pin' && !/(^|\.)pinterest\.(com|com\.br|pt)$/.test(url.hostname)) return '';
      if (kind === 'image' && !/(^|\.)pinimg\.com$/.test(url.hostname)) return '';
      return url.href;
    } catch { return ''; }
  }

  function link(text, url) {
    const anchor = document.createElement('a');
    anchor.textContent = text;
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }

  function showPins(data) {
    controls.pins.replaceChildren();
    const pins = Array.isArray(data.pins) ? data.pins : [];
    if (!pins.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Nenhum Pin disponível nesta página da pasta.';
      controls.pins.append(empty);
    }
    for (const pin of pins) {
      const pinUrl = safeUrl(pin.url, 'pin');
      if (!pinUrl) continue;
      const article = document.createElement('article');
      article.className = 'pinterest-pin';
      const title = typeof pin.title === 'string' && pin.title.trim() ? pin.title : 'Pin no Pinterest';
      const imageUrl = safeUrl(pin.imageUrl, 'image');
      if (imageUrl) {
        const imageLink = link('', pinUrl);
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = title;
        image.loading = 'lazy';
        image.referrerPolicy = 'no-referrer';
        image.addEventListener('error', () => {
          image.remove();
          imageLink.textContent = 'Imagem indisponível. Ver no Pinterest ↗';
        }, {once: true});
        imageLink.append(image);
        article.append(imageLink);
      }
      const heading = document.createElement('h3');
      heading.textContent = title;
      article.append(heading, link('Ver Pin no Pinterest ↗', pinUrl));
      const sourceUrl = safeUrl(pin.sourceUrl);
      if (sourceUrl) article.append(link('Visitar fonte original ↗', sourceUrl));
      controls.pins.append(article);
    }
    nextBookmark = typeof data.bookmark === 'string' ? data.bookmark : '';
    controls.next.hidden = !nextBookmark;
    controls.status.textContent = pins.length + ' Pin(s) consultado(s) ao vivo. Confira a licença na fonte original antes de qualquer uso.';
  }

  controls.refresh.addEventListener('click', () => run('Verificando conexão…', async () => showConnection(await request())));
  controls.connect.addEventListener('click', () => run('Abrindo autorização oficial do Pinterest…', async () => {
    const data = await request({}, {action: 'connect'});
    const url = new URL(data.authorizationUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'www.pinterest.com' || url.pathname.replace(/\/$/, '') !== '/oauth' || url.username || url.password) {
      throw new Error('O endereço de autorização do Pinterest é inválido.');
    }
    window.location.assign(url.href);
  }));
  controls.disconnect.addEventListener('click', () => run('Desconectando Pinterest…', async () => {
    await request({}, {action: 'disconnect'});
    showConnection(await request());
    controls.status.textContent = 'Pinterest desconectado deste navegador. Você pode revogar o aplicativo também nas configurações do Pinterest.';
  }));
  async function loadBoards(more = false) {
    const data = await request({view: 'boards', ...(more ? {bookmark: boardsBookmark} : {})});
    if (!more) {
      resetPins();
      controls.boards.replaceChildren(new Option('Selecione uma pasta', ''));
    }
    const boards = Array.isArray(data.boards) ? data.boards : [];
    const known = new Set([...controls.boards.options].map(option => option.value));
    for (const board of boards) if (/^\d+$/.test(String(board.id))) {
      const id = String(board.id);
      if (!known.has(id)) {
        controls.boards.append(new Option(typeof board.name === 'string' ? board.name : 'Pasta ' + id, id));
        known.add(id);
      }
    }
    boardsBookmark = typeof data.bookmark === 'string' ? data.bookmark : '';
    controls.nextBoards.hidden = !boardsBookmark;
    controls.status.textContent = controls.boards.options.length > 1
      ? 'Pastas consultadas. Selecione uma para ver os Pins.' + (boardsBookmark ? ' Há mais pastas disponíveis.' : '')
      : 'Nenhuma pasta disponível para esta autorização.';
  }
  controls.loadBoards.addEventListener('click', () => run('Consultando suas pastas…', () => loadBoards()));
  controls.nextBoards.addEventListener('click', () => run('Consultando mais pastas…', () => loadBoards(true)));
  controls.boards.addEventListener('change', () => { resetPins(); updateButtons(); });
  controls.loadPins.addEventListener('click', () => run('Consultando os Pins da pasta…', async () => {
    activeBoard = controls.boards.value;
    showPins(await request({view: 'pins', boardId: activeBoard}));
  }));
  controls.next.addEventListener('click', () => run('Consultando a próxima página…', async () => {
    showPins(await request({view: 'pins', boardId: activeBoard, bookmark: nextBookmark}));
  }));
  run('Verificando conexão do Pinterest…', async () => {
    showConnection(await request());
    if (Object.hasOwn(callbackMessages, callbackResult)) controls.status.textContent = callbackMessages[callbackResult] + ' ' + controls.status.textContent;
  });
}
