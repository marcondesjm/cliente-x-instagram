# Padrão visual da MJM Digital

Aplique o [guia oficial da MJM Digital](docs/mjm-digital/Guia_de_Identidade_Visual_MJM_Digital.pdf) em todas as novas imagens da marca, incluindo posts, stories, capas e peças promocionais.

- Use verde-petróleo escuro (#08201A) no fundo principal, cinza-prata (#C9CBCB) nos textos sobre fundo escuro e dourado ocre (#CAA14F) nos botões e destaques.
- Use as cores de apoio conforme o guia. Verde acinzentado (#253530) para áreas secundárias, bronze (#976E43) para detalhes e para o J na versão clara da logo, âmbar queimado (#C48138) para ícones e destaques sobre fundo escuro, cinza asfalto (#3E3D37) para texto sobre fundo claro e preto (#000000) para aplicações monocromáticas.
- Aplique a arte original da logo e escolha a versão conforme o fundo. Preserve as proporções e uma margem livre equivalente à altura da palavra DIGITAL. Em avatares, priorize o monograma.
- Em capas do Facebook, mantenha nome, logo e serviços na área segura para celular. Posicione o nome e os serviços um pouco acima do centro.

## Tipografia

Aplique estas famílias em sites, materiais comerciais e nas próximas publicações da MJM Digital.

| Uso | Fonte | Peso |
| --- | --- | --- |
| Títulos | Bricolage Grotesque | 500 Medium |
| Subtítulos, selos e botões | Bricolage Grotesque | 600 SemiBold |
| Texto corrido e legendas | Bricolage Grotesque | 400 Regular |
| Palavra ou linha de destaque | Instrument Serif Italic | 400 Italic |

Em capas, posts e stories, mantenha a mensagem principal em Bricolage Grotesque e use o itálico em uma palavra ou linha curta. Exemplo: **Criação de sites** *para sua empresa*.

A tipografia foi conferida no [site da Moenda Café](https://moendacafe.com.br/). As famílias estão no Google Fonts: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) e [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif).

### Aplicação no site

Carregue [tipografia.css](docs/mjm-digital/tipografia.css) e aplique a classe `mjm-tipografia` na seção da marca. Use `mjm-titulo`, `mjm-subtitulo`, `mjm-botao` e `mjm-destaque` conforme o papel de cada elemento.

```html
<link rel="stylesheet" href="docs/mjm-digital/tipografia.css">

<section class="mjm-tipografia">
  <h1 class="mjm-titulo">
    Criação de sites <em class="mjm-destaque">para sua empresa</em>
  </h1>
  <p>Sites institucionais e landing pages.</p>
</section>
```

Ajuste o caminho do CSS à localização do HTML no projeto.


## Carrosséis e legendas do Instagram

- Use o verde-petróleo no fundo, verde acinzentado na caixa de leitura, cinza-prata no texto e dourado nos destaques. Aplique a logo original. A tipografia dos slides segue os pesos do guia. A legenda usa o texto nativo do Instagram.
- Na capa, apresente a pauta ou a pergunta. Nos slides seguintes, explique o que aconteceu ou como fazer, com exemplos, etapas ou listas curtas conforme o assunto. Feche com a conclusão ou com uma ação que o leitor possa testar.
- Escreva a legenda para que ela possa ser entendida sozinha. Use parágrafos curtos para desenvolver o contexto, os pontos principais e a conclusão. Em notícias, informe a data e a fonte e identifique a leitura prática para empresas. Em exercícios autorais, inclua um exemplo ou erro comum e a ação sugerida.
