# NK Fotografia — site do Nícolas Teodoro

Site estático (HTML + CSS + JS puros, sem framework e sem build obrigatório). Funciona em Hostinger, Netlify, Vercel ou GitHub Pages: é só publicar o conteúdo desta pasta `site/`.

Ferramentas usadas na manutenção: **Node 18+** e **ffmpeg** (para processar fotos e vídeos). Não há nenhum `npm install`.

```
nk-fotografia-site/
├── material-cliente/      ← o que o cliente mandou (NUNCA alterar)
├── fotos-entrada/         ← fotos/vídeos originais, uma pasta por categoria (NÃO é publicada)
├── PENDENTES-CLIENTE.md
└── site/                  ← ESTA pasta é o site publicado
    ├── index.html, eventos/, portfolio/, sobre/, orcamento/, 404.html   (páginas GERADAS)
    ├── data/config.js     ← textos, contatos, categorias, preços, FAQ
    ├── data/fotos.js      ← lista de fotos (gerada; você edita alt/legenda/sensivel/ordem)
    ├── data/videos.js     ← lista de vídeos (gerada)
    ├── templates/         ← moldes das páginas
    ├── scripts/           ← processar-fotos, gerar-paginas, checar-links, gerar-marca, servidor
    └── assets/{brand,img,video,css,js,fonts}
```

## Abrir no computador

```bash
cd site
node scripts/servidor.mjs        # abre em http://localhost:5173
```
(Não abra os `.html` com duplo clique: os links de pasta como `portfolio/` precisam de um servidor.)

## Adicionar fotos a uma categoria

1. Solte as fotos (JPG/PNG/WebP, de preferência os **originais**, não exportados do Instagram) em
   `fotos-entrada/<categoria>/`. As pastas válidas são os `slug` do `config.js`:
   `shows-e-artistas`, `casamentos`, `aniversarios-infantis`, `aniversarios-e-festas`, `cha-revelacao`, `ensaios`, `conteudo-social`, `corporativo`, `drone`, mais `perfil` (retrato do Nícolas) e `bastidores` (destaque "PRODUÇÃO").
   - **Um trabalho por subpasta** (recomendado): `fotos-entrada/casamentos/casamento-g-v/casamento-g-v-01.jpg`. Dê o nome que aparece no site em `config.js` → `albuns` (ex.: `"casamento-g-v": { titulo: "Casamento G & V" }`). A página do evento ganha um filtro por trabalho quando há 2 ou mais.
   - Os arquivos são lidos em ordem alfabética: numere (`-01`, `-02`…) na ordem em que a história deve ser contada.
   - **Não coloque originais em `site/assets/img`**: essa pasta é publicada. Ela só recebe as versões geradas pelo script.
   - Pastas que começam com `_` são ignoradas (ex.: `_duplicadas`).
2. Rode `node scripts/processar-fotos.mjs`. Ele:
   - gera AVIF + WebP + JPEG em 480 / 960 / 1600 / 2400 px (sem nunca ampliar);
   - **remove todos os metadados, inclusive o GPS**, das versões publicadas;
   - lê o EXIF (câmera, lente, f/, velocidade, ISO) e mostra no lightbox quando existir;
   - cria o placeholder borrado (LQIP) de cada foto;
   - gera a imagem de compartilhamento (Open Graph 1200×630) de cada categoria.
3. Abra `data/fotos.js` e troque cada `alt: "[DESCREVER: …]"` por uma descrição real
   (ex.: "Cantor de rap se apresentando sob luzes vermelhas no palco"). Ajuste `legenda` e a ordem, se quiser.
   - `sensivel: true` = foto com criança/menor em destaque. Fotos de `aniversarios-infantis` já entram marcadas.
   - `foco: "50% 25%"` (opcional) = onde cortar quando a foto aparece recortada (capa, cards). Use em fotos verticais para não cortar a cabeça.
4. Rode `node scripts/gerar-paginas.mjs`.
5. Rode `node scripts/checar-links.mjs` (tem que dar "zero arquivos locais quebrados").

Vídeos (MP4/MOV) vão na mesma pasta da categoria (o vídeo da mochila vai em `fotos-entrada/equipamento/`). O script cria o poster e uma **versão leve para a web** (H.264 até 720 px, no máximo ~1,2 Mbps, sem metadados); o original fica intacto. Ele avisa se a versão web passar de 10 MB. Depois, ligue o vídeo em `config.js`: na categoria (`video: "<id>"`), na home (`home.reelsSociais`, `home.destaquesVideo`, `home.exemploVideo`) ou na mochila (`videoEquipamento`).
   - Em `data/videos.js` dá para editar `titulo` e marcar `sensivel: true` (some junto com as fotos sensíveis).
   - Os vídeos que tocam sozinhos começam mudos e têm um botão de som.

**Mosaico "Momentos eternizados" (home):** `home.destaques` lista 8 fotos de eventos variados, na ordem dos espaços (1 = grande, 2 = vertical alta, 5 = segunda grande; os outros pedem foto horizontal). Faltando foto, ele completa sozinho alternando as categorias, e fotos sensíveis nunca entram. Cada foto leva para a página do seu evento. Outras 16 fotos, alternando os eventos, passam no rolo de filme logo abaixo.

## Ativar ou desativar uma categoria

Em `data/config.js`, em `categorias`, mude `ativa: true/false` e rode `gerar-paginas`. Categorias sem foto:
- com `mostrarPlaceholders: true`, aparecem com avisos `[FOTOS: …]` (bom para mostrar ao cliente);
- com `mostrarPlaceholders: false`, somem do site até ganharem fotos.

A capa de cada categoria é o campo `capa` (id da foto). Sem `capa`, usa a primeira foto da categoria.

## Trocar contatos e preços

Tudo em `data/config.js`, e depois `gerar-paginas`:
- **WhatsApp:** preencha `contato.whatsappNumero` (só dígitos, com 55 + DDD, ex.: `5511912345678`).
  Enquanto estiver vazio, os botões usam o link da bio (`wa.me/message/…`), que **não aceita mensagem pronta**.
  Por isso o checador de data e o orçamento mostram a mensagem com o botão **Copiar mensagem**.
  Com o número preenchido, os botões já abrem o WhatsApp com o texto pronto.
- **Preço:** `preco: 1500` numa categoria mostra "a partir de R$ 1.500" (página da categoria e orçamento).
  `preco: null` mostra "sob consulta". Nunca coloque valor que o cliente não informou.
- **Serviços a confirmar:** em `formatos`, `entregas` e `combina`, `oferece: null` aparece como "[CONFIRMAR]"; `true` confirma; `false` esconde.
- **Domínio:** preencha `siteUrl` (ex.: `https://www.nkfotografia.com.br`) para gerar canonical, sitemap e imagens de compartilhamento com endereço completo. **Sem isso, a prévia do link no WhatsApp não mostra a foto.**

## Antes de publicar

1. Preencha o que estiver em `PENDENTES-CLIENTE.md`.
2. Em `config.js`: `mostrarPlaceholders: false` (esconde todos os avisos amarelos) e confira `mostrarFotosSensiveis`.
3. `node scripts/gerar-paginas.mjs && node scripts/checar-links.mjs --externos`.

## Publicar

- **Hostinger:** envie o **conteúdo** de `site/` para `public_html` (Gerenciador de Arquivos ou FTP). O `.htaccess` já liga compressão, cache e a página 404.
- **Netlify:** arraste a pasta `site/` em app.netlify.com/drop (ou conecte o repositório com "Publish directory: site"). O `_headers` cuida do cache.
- **Vercel:** importe o repositório e defina "Root Directory: site", sem comando de build.
- **GitHub Pages:** publique a pasta `site/` (Actions ou branch `gh-pages`). Se ficar num subcaminho (`usuario.github.io/repo/`), coloque essa URL no `siteUrl`, para a 404 apontar certo.

## Bom saber

- **Proteção das fotos:** o site bloqueia o "arrastar" e o clique direito **só nas fotos**, e tem marca d'água opcional (`marcaDagua: true`). Isso **não impede cópia de verdade** (print, ferramentas do navegador). O que protege de fato é publicar só versões em até 2400 px.
- **Abertura animada:** aparece uma vez por sessão e é desligada para quem usa "reduzir movimento" no sistema.
- **Guia de marca:** `assets/brand/brand.html`, com paleta, tipografia, monograma em SVG e os motivos gráficos. Dá para entregar ao cliente. Para regenerar os SVGs: `node scripts/gerar-marca.mjs`.
- **Resultados do Lighthouse (celular, 4G simulado), com as 68 fotos:** Performance de 93 a 97 na home, Shows, Casamentos, Ensaios e Sobre; o Portfólio, que tem todas as fotos numa página só, fica entre 83 e 94 conforme a carga do computador. Acessibilidade, Boas práticas e SEO dão 100 em todas.

## Sugestões para o Nícolas

- Criar o **Perfil da Empresa no Google** (Google Meu Negócio) como "Fotógrafo" em São Paulo, com link para o site e as mesmas fotos. É o que mais traz busca local ("fotógrafo de aniversário infantil SP").
- Colocar o **link do site na bio** do Instagram (hoje ela leva só ao WhatsApp). O site já leva ao WhatsApp com a mensagem pronta.
- Mandar o link da categoria certa para cada cliente (ex.: `/portfolio/?evento=shows-e-artistas`). O filtro vai junto no link.
