import json

path = r'automation\instagram-template\config\watchdog-errors.json'
keys_to_fix = [
    'sabedoria-kids:2026-10-28:1:40799238355',
    'sabedoria-kids:2026-10-28:1:40805960769',
    'sabedoria-kids:2026-10-28:1:40809318440'
]

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0
for item in data:
    if item.get('key') in keys_to_fix and item.get('status') == 'open':
        item['status'] = 'resolved'
        item['resolvedAt'] = '2026-10-30T00:00:00.000Z'
        fixed_count += 1

if fixed_count > 0:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Sucesso: {fixed_count} erros do Sabedoria Kids marcados como resolvidos.')
else:
    print('Nenhum erro aberto encontrado para essas chaves (já estavam resolvidos).')