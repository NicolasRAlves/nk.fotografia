# Pendentes do cliente · NK Fotografia

Tudo o que falta para o site sair do modo de apresentação. Cada item aparece no site como um aviso amarelo `[CLIENTE INFORMAR: …]` enquanto `mostrarPlaceholders: true`. Onde preencher: `site/data/config.js`. Depois, rode `node scripts/gerar-paginas.mjs`.

## Urgente (sem isso não dá para publicar bem)

- [ ] **Número do WhatsApp** (com DDD). Hoje só existe o link da bio `wa.me/message/6G4BFG2XBSRQP1`, que não aceita mensagem pronta. → `contato.whatsappNumero`
- [ ] **Domínio do site** (ex.: nkfotografia.com.br). Necessário para sitemap, canonical e a prévia com foto no WhatsApp. → `siteUrl`
- [ ] **Autorização das fotos com menores** (todas estão no ar marcadas como sensíveis). Sem autorização dos responsáveis, mude `mostrarFotosSensiveis` para `false`:
  - Aniversário de 1 ano: 6 fotos. O **nome da criança aparece** no topo do bolo e no painel "Wanted".
  - Ensaio de 15 anos: 6 fotos.
  - Casamento G & V: 1 foto com as daminhas de frente (`casamento-g-v-16`).
  - Vídeo de bastidor do ensaio (`ensaio-bastidor-camera`): o menino do ensaio de 15 anos aparece na tela da câmera.
  - 15 anos: 2 fotos (`debutante-letreiro-15`, `valsa-debutante-pai`).
- [ ] **Show do Veigh**: pode citar o nome do artista no site? As 16 fotos são todas dele? (há fotos com roupas diferentes). → `albuns.veigh` no `config.js`
- [ ] **Aprovação das categorias**: Shows & Artistas · Casamentos · Aniversários Infantis · Aniversários, 15 anos & Festas · Chá Revelação *(nova)* · Ensaios & Retratos · Conteúdo para Redes · Eventos Corporativos *(confirmar)* · Imagens Aéreas (Drone)

## Fotos e vídeos (originais, sem a compressão do Instagram)

O site tem **68 fotos na galeria** (63 novas em alta, mais 5 antigas de 1080 px) e o retrato do Nícolas. Cada subpasta em `fotos-entrada/<categoria>/` vira um "trabalho" com filtro próprio na página do evento:

| Categoria | Tem | Precisa |
|---|---|---|
| Shows & Artistas | 18 (Show do Veigh + 2 antigas) | outros artistas/shows para variar |
| Casamentos | 21 (Casamento G & V) | ok · mais um casamento ajudaria |
| Aniversários Infantis | 6 (Aniversário de 1 ano) | 12 a 24, de preferência mais uma festa |
| Aniversários, 15 anos & Festas | 2 (antigas, 1080 px) | 12 a 24, em alta |
| Chá Revelação | 11 | ok |
| Ensaios & Retratos | 10 (15 anos, retrato profissional + 1 antiga) | ok |
| Eventos Corporativos | 0 | 12 a 24 (se a categoria for mantida) |
| Conteúdo para Redes | 0 | 12 a 24 + 3 reels |
| Imagens Aéreas (Drone) | 0 | 12 a 24 e/ou um vídeo |
| Bastidores (destaque "PRODUÇÃO") | 0 | 5 a 8 |

- [x] **Retrato do Nícolas**: já está no site (home e Sobre). Uma versão maior que 1023 px deixaria a foto mais nítida em telas grandes.
- [x] **Vídeos já no site**: 3 reels na home (pista de casamento, noivo antes do sim, bastidor de ensaio), o do noivo também na página de Casamentos, o de bastidor na de Ensaios, e o da mochila em "Na minha mochila".
- [ ] **Um reel de show** para a página de Shows (e, se quiser, um reel no mosaico "Momentos eternizados" da home → `home.destaquesVideo`)
- [ ] Vídeos para as outras categorias (aftermovie 16:9 ou reel 9:16) e, se houver, um vídeo mudo para o hero da home
- [ ] **Logo em alta**: só existe um JPEG de 810 px, com fundo. O monograma já foi redesenhado em SVG (veja `site/assets/brand/brand.html`). Falta a aprovação do cliente.
- [ ] Quem é a pessoa na foto `retrato-ceu-dramatico`? Se for o Nícolas, ela pode ir para "Quem está por trás".

## Textos e informações

- [ ] Texto do carrossel **"Quem está por trás desse perfil?"** (seção da home + página Sobre) → `sobre.textoCurto`, `sobre.historia`
- [ ] **E-mail** → `contato.email`
- [ ] **Região de atendimento**: só SP capital? Grande SP? Viaja? → `regiaoAtendimento`
- [ ] **Pacotes e preços** ("a partir de"), por categoria → `preco` em cada categoria
- [ ] **Prazo de entrega** e **forma de entrega** (galeria online? qual plataforma?) → `inclusoPadrao`, `processo`
- [ ] **Quantidade média de fotos** por hora / por evento → `inclusoPadrao`
- [ ] Trabalha com **segundo fotógrafo ou equipe**? → `sobre.comoTrabalho`, `faqGeral`
- [ ] **Lista do equipamento** em texto (o vídeo da mochila já está no site) e, se quiser, o link do reel no Instagram → `equipamento`, `reelEquipamento`
- [ ] **Clientes e artistas que podem ser citados** (nome e @, com autorização) → `clientes`
- [ ] **Depoimentos** (com autorização). Hoje o site não tem seção de depoimentos, para não inventar nada.
- [ ] **Drone**: é homologado (ANAC/DECEA) para uso comercial? O site não afirma nada até essa confirmação.
- [ ] Oferece **reels no mesmo dia**, **vídeo de melhores momentos**, **aftermovie**? → `oferece` em `formatos`/`entregas`/`combina`
- [ ] Política de uso de imagem de crianças no Instagram (FAQ de Aniversários Infantis)
- [ ] **CNPJ/MEI** e se emite nota fiscal (FAQ de Corporativo)
- [ ] Link do canal do Instagram **"Comunidade audiovisual"** → `contato.canal`
- [ ] Confirmar o **Threads**: está como `https://www.threads.com/@nk_fotografia_t` (o endereço responde)
