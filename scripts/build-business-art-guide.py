from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import json, os
import pymupdf as fitz
pdfmetrics.registerFont(TTFont('Arial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','C:/Windows/Fonts/arialbd.ttf'))
p='docs/reports/Cliente-X-Direcao-Arte-Claude-v1.pdf'
c=canvas.Canvas(p,pagesize=(595.28,841.89));c.setTitle('Cliente X | Direção de arte com Claude v1')
def base(n):
 c.setFillColor(HexColor('#073f48'));c.rect(0,730,596,112,fill=1,stroke=0)
 c.setFillColor(white);c.setFont('ArialBold',24);c.drawString(42,790,'Direção de arte com Claude')
 c.setFont('Arial',11);c.drawString(42,764,'Marcondes Machado · IA aplicada a empresas · v1 · 18/10/2026')
 c.setFillColor(HexColor('#52636a'));c.setFont('Arial',9);c.drawString(42,28,'business-editorial-v1 · Ilustrações editoriais identificadas · '+str(n))
def paragraph(text,y,size=11,width=510):
 c.setFillColor(HexColor('#18313b'));c.setFont('Arial',size)
 words=text.split();line=''
 for word in words:
  test=(line+' '+word).strip()
  if pdfmetrics.stringWidth(test,'Arial',size)>width:c.drawString(42,y,line);y-=17;line=word
  else:line=test
 if line:c.drawString(42,y,line);y-=17
 return y-10
base(1);y=690
for title,body in [
 ('O que muda','O Claude passa a planejar a composição de cada cartão. Em vez do mesmo diagrama repetido, o conjunto usa cena de trabalho, conversa simulada, fluxo, checklist e decisão.'),
 ('Uma narrativa visual completa','Cada carrossel recebe quatro artes distintas, ligadas ao texto. O Story recebe uma quinta composição. Capa, desenvolvimento, conferência e ação final mantêm o conteúdo completo.'),
 ('Como a API participa','O fluxo gera o roteiro, pode revisar um rascunho inválido, solicita a direção de arte estruturada e executa uma revisão independente dos cinco renders. Rótulos das ilustrações também entram na conferência factual.'),
 ('O que impede a publicação','Texto cortado, composição repetida, rótulo fora do briefing, alegação sem suporte ou reprovação visual bloqueiam a liberação. A prévia de teste não entra no estoque publicável.'),
 ('Como avaliar o resultado','Compare salvamentos, compartilhamentos, visitas ao perfil e novos seguidores em períodos equivalentes. Aparência mais atraente é uma hipótese editorial, sem garantia de alcance ou crescimento.')]:
 c.setFillColor(HexColor('#073f48'));c.setFont('ArialBold',14);c.drawString(42,y,title);y-=24;y=paragraph(body,y)
c.showPage();base(2)
c.setFillColor(HexColor('#073f48'));c.setFont('ArialBold',16);c.drawString(42,690,'Exemplo de composição renderizada')
y=paragraph('Demonstração técnica com roteiro já existente. Esta página mostra o padrão de composição; não representa uma nova publicação ou uma aprovação do teste real na nuvem.',663)
r=json.load(open('output/business-art/receipt.json',encoding='utf-8'))
for x,path,label in [(62,r['imagePaths'][0],'Quadro vertical de abertura'),(332,r['storyImagePath'],'Story com outra composição')]:
 c.setFillColor(HexColor('#18313b'));c.setFont('ArialBold',10);c.drawString(x,575,label)
 c.drawImage(ImageReader(path),x,185,width=202.5,height=360,preserveAspectRatio=True,anchor='c')
c.setFillColor(HexColor('#18313b'));c.setFont('Arial',10);c.drawString(42,140,'A fotografia jornalística continua exigindo fonte e pertinência.')
c.drawString(42,122,'Uma ilustração fictícia não é apresentada como evidência de um fato real.')
c.save();doc=fitz.open(p)
os.makedirs('output/business-art/pdf',exist_ok=True)
for i,page in enumerate(doc):page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save('output/business-art/pdf/page-'+str(i+1)+'.png')
assert len(doc)==2
print(p)
