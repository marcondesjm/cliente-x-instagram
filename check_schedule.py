import json
from datetime import datetime

# Load accounts config
with open(r'automation\instagram-template\config\accounts.json', 'r', encoding='utf-8') as f:
    accounts = json.load(f)

sk = next((a for a in accounts if a.get('account') == 'sabedoria-kids'), None)
if not sk:
    print('Conta sabedoria-kids não encontrada.')
else:
    crons = sk.get('schedule', [])
    now = datetime.now()
    today_str = now.strftime('%Y-%m-%d')
    print(f'Horários agendados para Sabedoria Kids hoje ({today_str}):')

    upcoming = []
    for c in crons:
        parts = c.split()
        if len(parts) == 5:
            minute, hour = int(parts[0]), int(parts[1])
            dt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            status = 'JÁ PASSOU' if dt < now else 'AGUARDANDO'
            print(f' {dt.strftime("%H:%M")} - {status}')
            if dt > now:
                upcoming.append(dt.strftime("%H:%M"))

    if upcoming:
        print(f'\nPróximo horário: {upcoming[0]}')
    else:
        print('\nNão há mais horários agendados para hoje.')

# Check content packs
try:
    with open(r'automation\instagram-template\config\content-packs.json', 'r', encoding='utf-8') as f:
        packs = json.load(f)

    sk_packs = next((p for p in packs if p.get('account') == 'sabedoria-kids'), None)
    if sk_packs:
        total = len(sk_packs.get('packs', []))
        print(f'\nConteúdo disponível: {total} pack(s) cadastrado(s)')

        # Count ready vs research
        ready_count = 0
        research_count = 0
        for pack in sk_packs.get('packs', []):
            slides = pack.get('slides', [])
            has_caption = bool(pack.get('caption'))
            if slides and has_caption:
                ready_count += 1
            else:
                research_count += 1

        print(f'  Prontos para postar: {ready_count}')
        print(f'  Em pesquisa/pendentes: {research_count}')
    else:
        print('\nNenhum pack de conteúdo encontrado para sabedoria-kids.')
except Exception as e:
    print(f'Erro ao ler content-packs: {e}')