"""Build the downloadable guide from persisted Kids review state (PyMuPDF)."""
import argparse
import json
from pathlib import Path
import pymupdf as pdf

parser = argparse.ArgumentParser()
parser.add_argument('--date', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
state = json.loads((root / 'automation/instagram-template/config/kids-scene-replenishment.json').read_text(encoding='utf-8-sig'))
pilot = state.get('pilotRun', {})
if pilot.get('status') == 'running':
    raise SystemExit('Wait for the pilot to finish before publishing its result.')
date = '/'.join(reversed(args.date.split('-')))
doc = pdf.open()
page = doc.new_page(width=595, height=842)
regular = Path('C:/Windows/Fonts/arial.ttf')
bold = Path('C:/Windows/Fonts/arialbd.ttf')
page.insert_font(fontname='GuideRegular', fontfile=str(regular))
page.insert_font(fontname='GuideBold', fontfile=str(bold))
green = (.06, .25, .18)
ink = (.12, .17, .14)

def block(text, y, size=10.3, heavy=False, color=ink, x=42, right=553, bottom=790):
    spare = page.insert_textbox(pdf.Rect(x, y, right, bottom), text, fontsize=size,
        fontname='GuideBold' if heavy else 'GuideRegular', color=color, lineheight=1.25)
    if spare < 0:
        raise ValueError('Guide text overflow')
    return bottom - spare + 5

page.draw_rect(pdf.Rect(0, 0, 595, 12), color=green, fill=green)
y = block('Sabedoria Kids', 33, 25, True, green)
y = block(f'Reposição de cenas | Versão 1.8 | {date}', y + 1, 10.5)
y += 10
top = y
page.draw_rect(pdf.Rect(40, top, 555, top + 109), color=green if state.get('enabled') else (.7, .47, .12), fill=(.94, .98, .95) if state.get('enabled') else (1, .97, .89))
status = 'ATIVAÇÃO AINDA BLOQUEADA' if not state.get('enabled') else 'REPOSIÇÃO ATIVA'
y = block(status, top + 10, 12, True, x=51, right=544, bottom=top + 102)
if state.get('enabled') and state.get('activationEvidence'):
    result = 'O piloto aprovou uma seleção completa, com revisão dos pixels, evidência bíblica e render oficial. A reposição está ativa na nuvem, dentro das cotas. Material reprovado não entra na agenda. A prontidão das imagens e a publicação no Instagram são conferidas separadamente.'
elif pilot.get('status') == 'reviewed':
    result = 'O piloto produziu uma seleção automaticamente revisada. Isso não confirma montagem, render oficial ou publicação. A rotina recorrente só pode ser liberada após todas as verificações exigidas.'
else:
    result = 'O piloto mais recente não aprovou uma nova seleção completa. As reprovações continuam bloqueadas. Testes locais bem-sucedidos e uma execução técnica do GitHub não comprovam acurácia do serviço de visão.'
y = block(result, y + 2, 10.4, x=51, right=544, bottom=top + 103)
y = top + 123

sections = [
    ('1. Ler cada imagem sem induzir a resposta',
     'A leitura individual recebe somente os pixels, sem legenda, passagem ou nomes. Imagens não confirmadas são descartadas. O cache vincula observação, modelo, prompt e hashes do original e do JPEG enviado.'),
    ('2. Conferir opções antes de montar a sequência',
     'Cada par de imagem e cartão é avaliado antes da escolha. O código procura uma combinação completa sem reutilizar imagens. A capa retrata o título; atividade familiar e leitura usam cenas pertinentes da passagem, sem encenar desenhar ou ler como fatos bíblicos.'),
    ('3. Exigir uma segunda revisão e evidência bíblica',
     'A segunda avaliação vê cada imagem separadamente, identificada por posição e código. Confere pixels, texto, segurança e variedade sem reescrever a observação original. Outra checagem exige citações da passagem para o evento representado; roupas e cenário do desenho não viram afirmações históricas.'),
    ('4. Montar e conferir o render oficial',
     'A seleção aprovada ainda precisa passar por download íntegro, licença, créditos, vínculo com os textos e render de Feed e Story. Fonte: Sweet Publishing / FreeBibleimages, com licença compatível verificada. A passagem integral usa World English Bible, em domínio público.'),
    ('5. Exigir testes de precisão e respeitar as cotas',
     'A liberação exige quatro casos visuais, seis factuais e dois de composição, incluindo rejeições e espelhos. Os testes são renovados diariamente. Piloto: até 10 chamadas, 1,2 milhão de tokens e 25 minutos. Rotina: 26 chamadas e 1,5 milhão de tokens por dia; recibos desconhecidos contam pelo máximo.'),
    ('6. Acompanhar prontidão e publicação separadamente',
     'Busca: 05h35, 11h35, 17h35 e 23h35 BRT. Reposição preparada: às 05h40, 11h40, 17h40 e 23h40; montagem às 05h50, 11h50, 17h50 e 23h50. A fila e o catálogo finito podem deixar horários sem material. Consulte o painel e o histórico real; publicação exige IDs e link do Instagram.')
]
for title, body in sections:
    y = block(title, y + 3, 12, True, green)
    y = block(body, y, 11.1)
if y > 787:
    raise ValueError(f'Footer overlap: {y}')
page.draw_line(pdf.Point(42, 802), pdf.Point(553, 802), color=(.75, .82, .78))
page.insert_text((42, 818), 'Painel: cliente-x-instagram.vercel.app | Guia 1.8 | 1/1', fontname='GuideRegular', fontsize=8, color=green)
doc.set_metadata({'title':'Sabedoria Kids - Reposição de cenas v1.8','author':'Sabedoria Kids','subject':'Prontidão, diagnóstico e limites da validação de cenas'})
target = root / 'docs/reports/Sabedoria-Kids-Reposicao-Cenas-v1.pdf'
doc.save(target, garbage=4, deflate=True)
preview = root / 'output/pdf/reposicao-cenas-v1.8.png'
preview.parent.mkdir(parents=True, exist_ok=True)
page.get_pixmap(matrix=pdf.Matrix(1.4, 1.4)).save(preview)
print(f'Guide saved; final body baseline {y:.1f}; preview: {preview}')
