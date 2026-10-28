/* =====================================================================
   NK Fotografia · configuração central do site
   ---------------------------------------------------------------------
   Tudo o que é texto, contato, categoria, preço e FAQ fica AQUI.
   Depois de editar, rode:  node scripts/gerar-paginas.mjs
   (as fotos ficam em data/fotos.js, gerado por scripts/processar-fotos.mjs)

   Regra de ouro: nada inventado. Onde falta informação do cliente, o valor
   fica vazio/null e o site mostra um aviso "[CLIENTE INFORMAR: …]" enquanto
   mostrarPlaceholders = true. Para publicar, preencha ou mude para false.
   ===================================================================== */
window.NK = {
  // Domínio final, sem barra no fim. Ex.: "https://www.nkfotografia.com.br"
  siteUrl: "", // [CLIENTE INFORMAR: domínio do site]

  // true  = mostra categorias vazias e avisos [CLIENTE INFORMAR] (bom para apresentar ao cliente)
  // false = esconde tudo que ainda não tem conteúdo (use ao publicar)
  mostrarPlaceholders: true,

  // Fotos marcadas como "sensivel" (ex.: menores de idade). Só deixe true com autorização dos responsáveis.
  mostrarFotosSensiveis: true, // [CLIENTE CONFIRMAR: autorização das fotos com menores — 15 anos, aniversário de 1 ano, daminhas]

  // Marca d'água discreta sobre as fotos (não impede cópia de verdade)
  marcaDagua: false,

  marca: "NK Fotografia",
  fotografo: "Nícolas Teodoro",
  cidade: "São Paulo",
  uf: "SP",
  experiencia: "+3 anos eternizando momentos",
  especialidade: "Especialista em eventos e conteúdo social.",
  cta: "Não deixe pra última hora",

  contato: {
    // Só dígitos, com 55 + DDD. Ex.: "5511912345678". Com o número, os botões já abrem o WhatsApp com a mensagem pronta.
    whatsappNumero: "", // [CLIENTE INFORMAR: número do WhatsApp]
    // Link atual da bio (não aceita mensagem pronta, por isso o site oferece "Copiar mensagem")
    whatsappLink: "https://wa.me/message/6G4BFG2XBSRQP1",
    email: "", // [CLIENTE INFORMAR: e-mail]
    instagram: "https://www.instagram.com/nk_fotografia_t",
    instagramUser: "@nk_fotografia_t",
    threads: "https://www.threads.com/@nk_fotografia_t",
    canal: "", // [CLIENTE INFORMAR: link do canal "Comunidade audiovisual"]
    canalNome: "Comunidade audiovisual",
  },

  regiaoAtendimento: "", // [CLIENTE INFORMAR: só SP capital? Grande SP? viaja?]

  // ---------- HOME ----------
  home: {
    // ids de data/fotos.js — 3 a 5 fotos fortes de categorias diferentes
    hero: ["veigh-03", "casamento-g-v-13", "cha-revelacao-parque-02", "veigh-01"],
    heroVideo: null, // id de data/videos.js (reel mudo em loop), se houver um bom
    instagram: ["veigh-02", "casamento-g-v-10", "cha-revelacao-parque-02", "ensaio-paula-02", "veigh-05", "casamento-g-v-21"],
    reelsSociais: ["casamento-reel-pista", "casamento-noivo-antes-do-sim", "ensaio-bastidor-camera"], // ids de data/videos.js (3 reels verticais)
    // exemplos reais do bloco "Foto · Vídeo · Drone"
    exemploFoto: "casamento-g-v-07",
    exemploVideo: "casamento-reel-pista", // id de data/videos.js
    exemploDrone: null, // id de data/fotos.js (categoria drone) ou de data/videos.js
    // Mosaico "Momentos eternizados": 8 fotos de eventos variados, na ordem dos espaços do mosaico
    // (1 = grande, 2 = vertical alta, 5 = segunda grande; os outros são menores e horizontais).
    // Faltando fotos, ele completa sozinho alternando as categorias. Fotos sensíveis nunca entram aqui.
    // O "rolo de filme" logo abaixo passa outras fotos, uma de cada categoria por vez.
    destaques: ["veigh-01", "ensaio-paula-02", "cha-revelacao-parque-02", "rap-no-meio-do-publico", "casamento-g-v-13", "cha-revelacao-parque-10", "veigh-02", "casamento-g-v-21"],
    destaquesVideo: null, // id de data/videos.js (reel vertical no lugar do espaço 2), se quiser
  },

  // ---------- QUEM ESTÁ POR TRÁS ----------
  sobre: {
    foto: "nicolas-teodoro", // id de data/fotos.js (categoria "perfil")
    textoCurto: null, // [CLIENTE ENVIAR: texto do carrossel "Quem está por trás desse perfil?"]
    historia: null,   // [CLIENTE ENVIAR: história completa para a página Sobre]
    comoTrabalho: null, // [CLIENTE INFORMAR: equipe? segundo fotógrafo? como é a cobertura?]
  },

  // "Na minha mochila" — baseado no reel "Qual equipamento eu levo para um dia de cobertura foto e vídeo"
  equipamento: [], // [CLIENTE INFORMAR] ex.: { item: "Câmera principal", modelo: "…" }
  reelEquipamento: "", // link do reel no Instagram (opcional: o vídeo já está no site)
  videoEquipamento: "equipamento-mochila", // id de data/videos.js

  // Só nomes/@ AUTORIZADOS. Ex.: { nome: "Artista X", instagram: "@artista" }
  clientes: [], // [CLIENTE INFORMAR]

  // ---------- TRABALHOS ----------
  // Cada subpasta de fotos-entrada/<categoria>/ é um trabalho. Aqui fica o nome que aparece no site
  // (filtro da página do evento e legenda no visualizador). Sem nome aqui, a subpasta vira "Outros trabalhos".
  albuns: {
    "veigh": { titulo: "Show do Veigh" }, // [CLIENTE CONFIRMAR: pode citar o nome do artista? todas as fotos são do Veigh?]
    "casamento-g-v": { titulo: "Casamento G & V" },
    "cha-revelacao-parque": { titulo: "Chá revelação no parque" },
    "aniversario-1-ano": { titulo: "Aniversário de 1 ano" },
    "ensaio-15-anos": { titulo: "Ensaio de 15 anos" },
    "ensaio-paula": { titulo: "Retrato profissional" },
  },

  // ---------- SERVIÇOS (formulário de orçamento) ----------
  // oferece: true = confirmado · null = a confirmar com o cliente · false = não oferece (some do site)
  formatos: [
    { id: "foto", nome: "Foto", oferece: true },
    { id: "video", nome: "Vídeo", oferece: true },
    { id: "drone", nome: "Drone", oferece: true },
    { id: "reels", nome: "Reels/conteúdo no mesmo dia", oferece: null },
  ],
  entregas: [
    { id: "fotos", nome: "Fotos tratadas", oferece: true },
    { id: "melhores", nome: "Vídeo de melhores momentos", oferece: null },
    { id: "aftermovie", nome: "Aftermovie", oferece: null },
  ],

  // Como funciona (4 passos). prazo: null = [CLIENTE INFORMAR]
  processo: [
    { titulo: "Você me chama", texto: "Manda a data, o tipo de evento e o local no WhatsApp.", prazo: "" },
    { titulo: "Reservamos a data", texto: "Combinamos a cobertura e a data fica guardada pra você.", prazo: null },
    { titulo: "Eu cubro o evento", texto: "Chego, me misturo e registro tudo sem atrapalhar a festa.", prazo: "" },
    { titulo: "Você recebe as fotos", texto: "As fotos chegam tratadas, prontas pra guardar e postar.", prazo: null },
  ],

  // O que está incluso (padrão; cada categoria pode sobrescrever). texto null = [CLIENTE INFORMAR]
  inclusoPadrao: [
    { titulo: "Fotos tratadas", texto: null, dica: "quantidade média de fotos por hora" },
    { titulo: "Horas de cobertura", texto: null, dica: "pacotes de horas" },
    { titulo: "Vídeo", texto: null, dica: "o que entra no vídeo e a duração" },
    { titulo: "Entrega", texto: null, dica: "prazo e plataforma (galeria online?)" },
  ],

  // FAQ geral (página Sobre). r: null = não aparece enquanto não for confirmada
  faqGeral: [
    { p: "Você faz foto e vídeo?", r: "Faço. Dá pra contratar só foto, só vídeo ou os dois juntos na mesma cobertura." },
    { p: "Como eu reservo a minha data?", r: "Me chama no WhatsApp com a data, o tipo de evento e o local. A data fica reservada depois que a gente fecha tudo por lá — por isso, não deixe pra última hora." },
    { p: "Você atende fora de São Paulo?", r: null, dica: "região de atendimento" },
    { p: "Em quanto tempo recebo as fotos?", r: null, dica: "prazo de entrega" },
    { p: "Como as fotos são entregues?", r: null, dica: "galeria online? qual plataforma?" },
    { p: "Trabalha com segundo fotógrafo ou equipe?", r: null, dica: "equipe" },
  ],

  // ---------- CATEGORIAS (uma página por categoria ativa) ----------
  // tema: "escuro" | "claro" | "degrade" | "ceu"   ·  acento: menta | nevoa | pervinca | azul
  // preco: número em reais para "a partir de" — null = "sob consulta". Nunca invente.
  categorias: [
    {
      slug: "shows-e-artistas", nome: "Shows & Artistas", ativa: true, tema: "escuro", acento: "pervinca",
      frase: "Palco, público e bastidor. Eu fico onde a energia está.",
      descricao: "Cobertura de shows, festas e apresentações: o artista no palco, a reação do público e o que acontece por trás.",
      seoTitulo: "Fotógrafo de shows em SP", seoDescricao: "Fotos e vídeos de shows, festas e artistas em São Paulo. Palco, público e bastidores por Nícolas Teodoro (NK Fotografia).",
      capa: "veigh-03", capa2: "veigh-02",
      video: null, videoDica: "reel ou aftermovie de show",
      combina: [
        { titulo: "Reels no mesmo dia", texto: "Os primeiros cortes saem antes do público ir embora do assunto.", oferece: null },
        { titulo: "Vídeo de melhores momentos", texto: "Os picos do show num vídeo curto pra divulgar a próxima data.", oferece: null },
        { titulo: "Imagens com drone", texto: "O tamanho da plateia visto de cima, em locais abertos.", oferece: true },
      ],
      faq: [
        { p: "Você fotografa palco e público?", r: "Sim. Eu circulo entre o palco, a pista e o bastidor pra contar o show inteiro, não só o artista." },
        { p: "Dá pra receber fotos durante o evento?", r: null, dica: "entrega no mesmo dia" },
      ],
      preco: null,
    },
    {
      slug: "casamentos", nome: "Casamentos", ativa: true, tema: "claro", acento: "menta",
      frase: "Da chegada da noiva à última música: a cerimônia e a festa contadas sem pressa.",
      descricao: "Cobertura de casamento: preparativos, cerimônia, alianças, família, padrinhos e a pista cheia.",
      seoTitulo: "Fotógrafo de casamento em SP", seoDescricao: "Fotos e vídeos de casamento em São Paulo: cerimônia, alianças, família e festa. NK Fotografia, por Nícolas Teodoro.",
      capa: "casamento-g-v-13", capa2: "casamento-g-v-11",
      video: "casamento-noivo-antes-do-sim", videoDica: "melhores momentos de um casamento",
      combina: [
        { titulo: "Vídeo de melhores momentos", texto: "A entrada, o sim e a festa num vídeo pra rever (e mandar pra família).", oferece: null },
        { titulo: "Imagens com drone", texto: "O espaço e a cerimônia vistos de cima, em locais abertos.", oferece: true },
      ],
      faq: [
        { p: "Você cobre cerimônia e festa?", r: "Cubro. Dá pra contratar só a cerimônia ou o dia inteiro, da chegada da noiva até a pista." },
        { p: "Você faz ensaio pré-wedding?", r: null, dica: "oferece pré-wedding?" },
      ],
      preco: null,
    },
    {
      slug: "aniversarios-infantis", nome: "Aniversários Infantis", ativa: true, tema: "claro", acento: "menta",
      frase: "A decoração, o bolo, os parabéns e as caras de surpresa — sem atrapalhar a brincadeira.",
      descricao: "Festas infantis temáticas registradas com calma: detalhes da decoração, família, convidados e o momento do parabéns.",
      seoTitulo: "Fotógrafo de aniversário infantil em SP", seoDescricao: "Fotografia e vídeo de festa infantil em São Paulo: decoração, parabéns e família. NK Fotografia, por Nícolas Teodoro.",
      capa: "aniversario-1-ano-01", capa2: "aniversario-1-ano-02",
      video: null, videoDica: "melhores momentos de uma festa infantil",
      combina: [
        { titulo: "Imagens com drone", texto: "Para festas ao ar livre: o espaço e a decoração vistos de cima.", oferece: true },
        { titulo: "Vídeo de melhores momentos", texto: "Um vídeo curto pra família rever (e mandar pros avós).", oferece: null },
      ],
      faq: [
        { p: "As fotos das crianças vão pro seu Instagram?", r: null, dica: "política de uso de imagem de crianças" },
      ],
      preco: null,
    },
    {
      slug: "aniversarios-e-festas", nome: "Aniversários, 15 anos & Festas", ativa: true, tema: "claro", acento: "nevoa",
      frase: "Da entrada à valsa, do brinde à pista: a noite inteira contada em fotos.",
      descricao: "Aniversários, festas de 15 anos e comemorações: cerimonial, família, convidados e a pista cheia.",
      seoTitulo: "Fotógrafo de 15 anos e festas em SP", seoDescricao: "Fotos e vídeos de aniversários, festas de 15 anos e comemorações em São Paulo. NK Fotografia, por Nícolas Teodoro.",
      capa: "debutante-letreiro-15", capa2: "valsa-debutante-pai",
      video: null, videoDica: "aftermovie de uma festa de 15 anos",
      combina: [
        { titulo: "Vídeo de melhores momentos", texto: "A valsa, o discurso e a pista num vídeo só.", oferece: null },
        { titulo: "Imagens com drone", texto: "A chegada e o espaço da festa vistos de cima, em locais abertos.", oferece: true },
      ],
      faq: [
        { p: "Você cobre a festa inteira?", r: null, dica: "horas de cobertura" },
      ],
      preco: null,
    },
    {
      slug: "cha-revelacao", nome: "Chá Revelação", ativa: true, tema: "claro", acento: "menta",
      frase: "A expectativa, a surpresa e o abraço depois — do jeito que aconteceu.",
      descricao: "Chá revelação e chá de bebê: os detalhes da mesa, a reação na hora da surpresa e o casal, em casa, no salão ou ao ar livre.",
      seoTitulo: "Fotógrafo de chá revelação em SP", seoDescricao: "Fotos e vídeos de chá revelação em São Paulo: a surpresa, os detalhes e o casal. NK Fotografia, por Nícolas Teodoro.",
      capa: "cha-revelacao-parque-02", capa2: "cha-revelacao-parque-10",
      video: null, videoDica: "o momento da revelação em vídeo",
      combina: [
        { titulo: "Vídeo da revelação", texto: "A reação na hora da surpresa, com som, pra rever quantas vezes quiser.", oferece: null },
        { titulo: "Ensaio de gestante", texto: "Retratos do casal na mesma diária.", oferece: null },
      ],
      faq: [
        { p: "Dá pra fazer o chá revelação ao ar livre?", r: "Dá. Parque, quintal ou salão — me conta o lugar que eu planejo a luz e o horário." },
      ],
      preco: null,
    },
    {
      slug: "ensaios", nome: "Ensaios & Retratos", ativa: true, tema: "claro", acento: "azul",
      frase: "Retratos com direção leve — pra perfil profissional, aniversário ou só pra você.",
      descricao: "Ensaios e retratos em estúdio, locação ou ao ar livre, com direção simples e tratamento natural.",
      seoTitulo: "Ensaio fotográfico e retratos em SP", seoDescricao: "Ensaios e retratos em São Paulo para perfil, artistas e divulgação. NK Fotografia, por Nícolas Teodoro.",
      capa: "ensaio-paula-01", capa2: "ensaio-15-anos-01",
      video: "ensaio-bastidor-camera", videoDica: "bastidor de ensaio",
      combina: [
        { titulo: "Conteúdo para redes", texto: "Cortes verticais do ensaio pros stories e reels.", oferece: null },
      ],
      faq: [
        { p: "Quanto tempo dura um ensaio?", r: null, dica: "duração do ensaio" },
      ],
      preco: null,
    },
    {
      slug: "conteudo-social", nome: "Conteúdo para Redes", ativa: true, tema: "degrade", acento: "pervinca",
      frase: "Fotos e reels pensados pro feed — pra artistas, marcas e perfis que precisam postar com frequência.",
      descricao: "Produção de conteúdo social: reels, fotos para perfil e material para marcas, no formato certo para cada rede.",
      seoTitulo: "Produção de conteúdo para redes sociais em SP", seoDescricao: "Reels, fotos para perfil e conteúdo para marcas em São Paulo. NK Fotografia, especialista em conteúdo social.",
      capa: null, capa2: null,
      video: null, videoDica: "reel vertical produzido para um cliente",
      combina: [
        { titulo: "Ensaio de retratos", texto: "Fotos de perfil e de divulgação na mesma diária.", oferece: true },
        { titulo: "Imagens com drone", texto: "Tomadas aéreas que dão escala ao vídeo.", oferece: true },
      ],
      faq: [
        { p: "Você edita os reels?", r: null, dica: "edição e formato dos reels" },
      ],
      preco: null,
    },
    {
      slug: "corporativo", nome: "Eventos Corporativos", ativa: true, tema: "escuro", acento: "azul",
      frase: "Palestras, confraternizações e lançamentos com foto e vídeo prontos para a comunicação da empresa.",
      descricao: "Cobertura de eventos de empresa: palco, networking, marca e equipe, com material pensado para redes e imprensa.",
      seoTitulo: "Fotógrafo de eventos corporativos em SP", seoDescricao: "Foto e vídeo para eventos corporativos em São Paulo: palestras, confraternizações e lançamentos. NK Fotografia.",
      capa: null, capa2: null, confirmar: true,
      video: null, videoDica: "aftermovie de evento corporativo",
      combina: [
        { titulo: "Conteúdo para redes", texto: "Fotos e cortes verticais pro perfil da empresa.", oferece: null },
        { titulo: "Imagens com drone", texto: "Fachada, estrutura e público vistos de cima.", oferece: true },
      ],
      faq: [
        { p: "Você emite nota fiscal?", r: null, dica: "CNPJ/MEI" },
      ],
      preco: null,
    },
    {
      slug: "drone", nome: "Imagens Aéreas (Drone)", ativa: true, tema: "ceu", acento: "pervinca",
      frase: "O evento visto de cima: o tamanho do lugar, da festa e do público.",
      descricao: "Fotos e vídeos aéreos com drone para eventos, espaços e conteúdo, como complemento da cobertura ou em diária própria.",
      seoTitulo: "Filmagem com drone em SP", seoDescricao: "Fotos e filmagem aérea com drone para eventos e conteúdo em São Paulo. NK Fotografia, por Nícolas Teodoro.",
      capa: null, capa2: null,
      video: null, videoDica: "voo de drone em um evento",
      combina: [
        { titulo: "Cobertura de foto e vídeo", texto: "Chão e céu na mesma cobertura.", oferece: true },
      ],
      faq: [
        { p: "Dá pra voar em qualquer lugar?", r: "Não. Cada local tem regras de voo — me conta onde é o evento que eu verifico antes de fechar." },
        { p: "O drone é homologado?", r: null, dica: "situação do drone na ANAC/DECEA — não afirmar sem confirmação" },
      ],
      preco: null,
    },
  ],
};
