// =====================================================================
// NK Fotografia · pipeline de fotos e vídeos (Node 18+ e ffmpeg, sem dependências npm)
//
//   node scripts/processar-fotos.mjs            processa só o que é novo ou mudou
//   node scripts/processar-fotos.mjs --forcar   refaz tudo
//   node scripts/processar-fotos.mjs --entrada "C:\caminho\das\fotos"
//
// Entrada (fora da pasta publicada, para que originais com GPS nunca vão ao ar):
//   ../fotos-entrada/<slug-da-categoria>/*.jpg|png|webp     fotos
//   ../fotos-entrada/<slug-da-categoria>/*.mp4|mov|webm     vídeos
//   ../fotos-entrada/<slug-da-categoria>/<trabalho>/*.jpg   fotos de um trabalho (o nome vem de config.js → albuns)
//   ../fotos-entrada/perfil/                                retrato do Nícolas
//   pastas que começam com "_" são ignoradas (ex.: _duplicadas)
//
// Saída:
//   assets/img/<categoria>/<id>-<largura>.avif|webp|jpg   (480/960/1600/2400, nunca ampliando)
//   assets/video/<categoria>/<id>.mp4 + <id>-poster.jpg|webp
//   assets/img/og/<categoria>.jpg                         (1200×630 para WhatsApp/redes)
//   data/fotos.js e data/videos.js                        (alt/legenda/sensivel que você editar são preservados)
//
// Privacidade: todas as versões publicadas saem SEM metadados (-map_metadata -1), inclusive GPS.
// A ficha técnica (câmera, lente, f/, velocidade, ISO) é lida antes e guardada em data/fotos.js.
// =====================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, extname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const FORCAR = args.includes('--forcar');
const iEntrada = args.indexOf('--entrada');
const ENTRADA = iEntrada >= 0 ? resolve(args[iEntrada + 1]) : resolve(SITE, '..', 'fotos-entrada');
const LARGURAS = [480, 960, 1600, 2400];
const EXT_FOTO = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'];
const EXT_VIDEO = ['.mp4', '.mov', '.m4v', '.webm'];
const LIMITE_VIDEO_MB = 10;

// ---------- utilidades ----------
function carregar(arquivo, chave) {
  const p = join(SITE, 'data', arquivo);
  if (!existsSync(p)) return null;
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(p, 'utf8'), ctx);
  return ctx.window[chave];
}
function ff(bin, argv, { binario = false } = {}) {
  const r = spawnSync(bin, argv, { encoding: binario ? 'buffer' : 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${bin} não encontrado. Instale o ffmpeg (winget install Gyan.FFmpeg) e tente de novo.`);
  if (r.status !== 0) throw new Error(`${bin} falhou: ${(r.stderr || '').toString().slice(0, 400)}`);
  return r.stdout;
}
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rel = (p) => p.replace(SITE + '\\', '').replace(SITE + '/', '').replace(/\\/g, '/');

// ---------- EXIF (JPEG) — leitura mínima, sem dependências ----------
function lerExif(buf) {
  try {
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let i = 2;
    while (i < buf.length - 4) {
      if (buf[i] !== 0xff) return null;
      const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (m === 0xe1 && buf.toString('latin1', i + 4, i + 10) === 'Exif\0\0') return tiff(buf.subarray(i + 10, i + 2 + len));
      if (m === 0xda) return null;
      i += 2 + len;
    }
  } catch { /* EXIF corrompido: ignora */ }
  return null;
}
function tiff(t) {
  const le = t.toString('latin1', 0, 2) === 'II';
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
  const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
  const TAM = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const tags = {};
  const ifd = (off) => {
    const n = u16(off);
    for (let k = 0; k < n; k++) {
      const e = off + 2 + k * 12, tag = u16(e), tipo = u16(e + 2), qtd = u32(e + 4);
      const vo = (TAM[tipo] || 1) * qtd <= 4 ? e + 8 : u32(e + 8);
      let v = null;
      if (tipo === 2) v = t.toString('latin1', vo, vo + qtd).replace(/\0[\s\S]*$/, '').trim();
      else if (tipo === 3) v = u16(vo);
      else if (tipo === 4) v = u32(vo);
      else if (tipo === 5 || tipo === 10) { const a = u32(vo), b = u32(vo + 4); v = b ? a / b : null; }
      tags[tag] = v;
    }
  };
  ifd(u32(4));
  if (tags[0x8769]) ifd(tags[0x8769]);
  const make = tags[0x010f] || '', model = tags[0x0110] || '';
  const camera = model ? (model.toLowerCase().startsWith(make.toLowerCase().split(' ')[0]) ? model : `${make} ${model}`.trim()) : '';
  const exp = tags[0x829a];
  return {
    orientacao: tags[0x0112] || 1,
    camera: camera || null,
    lente: tags[0xa434] || null,
    focal: tags[0x920a] ? Math.round(tags[0x920a]) : null,
    abertura: tags[0x829d] ? Number(tags[0x829d].toFixed(1)) : null,
    velocidade: exp ? (exp >= 1 ? `${exp}s` : `1/${Math.round(1 / exp)}`) : null,
    iso: tags[0x8827] || null,
    gps: !!tags[0x8825],
  };
}
function legendaTecnica(e) {
  if (!e) return null;
  const p = [e.focal && `${e.focal}mm`, e.abertura && `f/${e.abertura}`, e.velocidade, e.iso && `ISO ${e.iso}`].filter(Boolean);
  return p.length >= 2 ? p.join(' · ') : null;
}
const ROTACAO = { 2: 'hflip,', 3: 'hflip,vflip,', 4: 'vflip,', 5: 'transpose=0,', 6: 'transpose=1,', 7: 'transpose=3,', 8: 'transpose=2,' };

// ---------- fotos ----------
function processarFoto(src, categoria, anterior, album = null) {
  const nome = basename(src, extname(src));
  const id = slugify(nome);
  const buf = readFileSync(src);
  const exif = lerExif(buf);
  const ori = exif?.orientacao || 1;
  const [w0, h0] = ff('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src]).trim().split(',').map(Number);
  const [w, h] = ori >= 5 ? [h0, w0] : [w0, h0];
  const larguras = LARGURAS.filter((l) => l < w);
  if (!larguras.length || w <= 2400) larguras.push(Math.min(w, 2400));
  const destino = join(SITE, 'assets', 'img', categoria);
  mkdirSync(destino, { recursive: true });

  const mtime = statSync(src).mtimeMs;
  const ultimo = join(destino, `${id}-${larguras.at(-1)}.jpg`);
  const atual = !FORCAR && anterior?.mtime === mtime && existsSync(ultimo);
  const rot = ROTACAO[ori] || '';

  if (!atual) {
    for (const L of larguras) {
      const vf = `${rot}scale=${L}:-2:flags=lanczos`;
      const base = ['-v', 'error', '-y', '-noautorotate', '-i', src, '-vf', vf, '-map_metadata', '-1', '-frames:v', '1'];
      ff('ffmpeg', [...base, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '33', '-cpu-used', '6', '-pix_fmt', 'yuv420p', join(destino, `${id}-${L}.avif`)]);
      ff('ffmpeg', [...base, '-c:v', 'libwebp', '-quality', '78', '-compression_level', '6', join(destino, `${id}-${L}.webp`)]);
      ff('ffmpeg', [...base, '-c:v', 'mjpeg', '-q:v', '4', join(destino, `${id}-${L}.jpg`)]);
    }
  }
  // LQIP: miniatura de 24px em WebP, embutida em base64 (aparece borrada enquanto a foto carrega)
  const lqip = atual && anterior?.lqip ? anterior.lqip : 'data:image/webp;base64,' +
    ff('ffmpeg', ['-v', 'error', '-noautorotate', '-i', src, '-vf', `${rot}scale=24:-2`, '-map_metadata', '-1', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '50', '-f', 'webp', 'pipe:1'], { binario: true }).toString('base64');

  if (exif?.gps) console.log(`   ⚑ ${id}: tinha GPS no original — removido das versões publicadas.`);
  const infantil = categoria === 'aniversarios-infantis';
  return {
    id, categoria, album,
    arquivo: `assets/img/${categoria}/${id}`,
    larguras, w, h,
    alt: anterior?.alt || `[DESCREVER: ${nome}]`,
    legenda: anterior?.legenda ?? '',
    sensivel: anterior?.sensivel ?? infantil, // fotos de festa infantil começam marcadas como sensíveis
    ...(anterior?.foco ? { foco: anterior.foco } : {}), // ponto de corte (ex.: "50% 25%") quando a foto aparece recortada
    exif: exif && (exif.camera || legendaTecnica(exif)) ? { camera: exif.camera, lente: exif.lente, tecnica: legendaTecnica(exif) } : null,
    lqip, mtime,
  };
}

// ---------- vídeos ----------
function processarVideo(src, categoria, anterior) {
  const id = slugify(basename(src, extname(src)));
  const info = JSON.parse(ff('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', src]));
  const v = info.streams.find((s) => s.codec_type === 'video');
  const rotacao = Math.abs(Number(v?.side_data_list?.find((d) => d.rotation !== undefined)?.rotation || v?.tags?.rotate || 0));
  let [w, h] = [v.width, v.height];
  if (rotacao === 90 || rotacao === 270) [w, h] = [h, w];
  const dur = Number(info.format.duration || 0);
  const mb = statSync(src).size / 1048576;
  const [n, d] = (v.avg_frame_rate || '0/1').split('/').map(Number);
  const destino = join(SITE, 'assets', 'video', categoria);
  mkdirSync(destino, { recursive: true });
  const ext = '.mp4';
  const saida = join(destino, id + ext);
  if (FORCAR || !existsSync(saida) || anterior?.mtime !== statSync(src).mtimeMs) {
    // Versão para a web (o original em fotos-entrada fica intacto): H.264 até 720 px de largura,
    // sem metadados, com faststart para começar a tocar antes de baixar tudo.
    // Arquivos já leves (até 3 MB, H.264) só são remontados, sem perder qualidade.
    const leve = mb <= 3 && v.codec_name === 'h264';
    const temAudio = info.streams.some((s) => s.codec_type === 'audio');
    ff('ffmpeg', ['-v', 'error', '-y', '-i', src, '-map_metadata', '-1', '-movflags', '+faststart',
      ...(leve ? ['-c', 'copy']
        : ['-vf', "scale='min(720,iw)':-2", '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '1200k', '-bufsize', '2400k', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
          ...(temAudio ? ['-c:a', 'aac', '-b:a', '96k'] : ['-an'])]),
      saida]);
    const t = Math.min(2, dur / 4).toFixed(2);
    ff('ffmpeg', ['-v', 'error', '-y', '-ss', t, '-i', src, '-frames:v', '1', '-vf', `scale='min(720,iw)':-2`, '-q:v', '5', join(destino, `${id}-poster.jpg`)]);
    ff('ffmpeg', ['-v', 'error', '-y', '-ss', t, '-i', src, '-frames:v', '1', '-vf', `scale='min(540,iw)':-2`, '-c:v', 'libwebp', '-quality', '70', join(destino, `${id}-poster.webp`)]);
  }
  const mbWeb = statSync(saida).size / 1048576;
  console.log(`   ▶ ${id}: ${w}×${h}, ${dur.toFixed(1)}s, ${d ? (n / d).toFixed(2) : '?'} fps, ${mb.toFixed(1)} MB → ${mbWeb.toFixed(1)} MB na web`);
  if (mbWeb > LIMITE_VIDEO_MB) console.log(`     ⚠ a versão web ainda passa de ${LIMITE_VIDEO_MB} MB: considere um corte mais curto.`);
  const [ws, hs] = (() => { const r = Math.min(1, 720 / w); return [Math.round(w * r / 2) * 2, Math.round(h * r / 2) * 2]; })();
  return {
    id, categoria, arquivo: `assets/video/${categoria}/${id}${ext}`, poster: `assets/video/${categoria}/${id}-poster`,
    w: ws, h: hs, formato: h > w ? 'reel' : 'aftermovie', duracao: Math.round(dur), audio: info.streams.some((s) => s.codec_type === 'audio'),
    titulo: anterior?.titulo || `[DESCREVER: ${id}]`, sensivel: anterior?.sensivel ?? false, mtime: statSync(src).mtimeMs,
  };
}

// ---------- Open Graph por categoria (1200×630) ----------
function gerarOG(foto, nome) {
  const pasta = join(SITE, 'assets', 'img', 'og');
  mkdirSync(pasta, { recursive: true });
  const src = join(SITE, `${foto.arquivo}-${foto.larguras.at(-1)}.jpg`);
  const mono = join(SITE, 'assets', 'brand', 'nk-monograma-branco.png');
  const grad = 'gradients=s=1200x14:c0=0xCEF3E1:c1=0xB9DAEB:c2=0xA2BFF7:nb_colors=3:x0=0:y0=7:x1=1199:y1=7:speed=0';
  const fc = '[0]scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630,setsar=1[bg];' +
    '[1]scale=120:-1,format=rgba,colorchannelmixer=aa=0.92[m];[bg][m]overlay=W-w-44:H-h-50[t];[t][2]overlay=0:H-h:shortest=1';
  ff('ffmpeg', ['-v', 'error', '-y', '-i', src, '-i', mono, '-f', 'lavfi', '-i', grad, '-filter_complex', fc, '-frames:v', '1', '-q:v', '3', '-map_metadata', '-1', join(pasta, `${nome}.jpg`)]);
}

// ---------- execução ----------
console.log(`Entrada: ${ENTRADA}`);
if (!existsSync(ENTRADA)) { console.error('Pasta de entrada não existe.'); process.exit(1); }
const config = carregar('config.js', 'NK');
const fotosAntes = Object.fromEntries((carregar('fotos.js', 'NK_FOTOS') || []).map((f) => [f.id, f]));
const videosAntes = Object.fromEntries((carregar('videos.js', 'NK_VIDEOS') || []).map((v) => [v.id, v]));
const fotos = [], videos = [];
const slugsValidos = new Set([...config.categorias.map((c) => c.slug), 'perfil', 'bastidores', 'equipamento']); // equipamento = vídeo da mochila

// Cada subpasta dentro da categoria é um "trabalho" (ex.: fotos-entrada/casamentos/casamento-g-v/).
// O nome do trabalho que aparece no site vem de config.js → albuns. Pastas começando com "_" são ignoradas.
const ignorar = (n) => n.startsWith('.') || n.startsWith('_');
function listar(dir, album = null) {
  const saida = [];
  for (const n of readdirSync(dir).filter((f) => !ignorar(f)).sort((a, b) => a.localeCompare(b))) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!album) saida.push(...listar(p, slugify(n))); }
    else saida.push({ src: p, nome: n, album });
  }
  return saida;
}

for (const pasta of readdirSync(ENTRADA).sort()) {
  const dir = join(ENTRADA, pasta);
  if (!statSync(dir).isDirectory() || ignorar(pasta)) continue;
  if (!slugsValidos.has(pasta)) { console.log(`⚠ pasta "${pasta}" não corresponde a nenhuma categoria do config.js — ignorada.`); continue; }
  const arquivos = listar(dir);
  if (!arquivos.length) continue;
  console.log(`\n■ ${pasta} (${arquivos.length} arquivo(s))`);
  for (const { src, nome: a, album } of arquivos) {
    const ext = extname(a).toLowerCase();
    try {
      if (EXT_FOTO.includes(ext)) {
        const f = processarFoto(src, pasta, fotosAntes[slugify(basename(a, ext))], album);
        const kb = Math.round(statSync(src).size / 1024);
        console.log(`   ✓ ${f.id}: ${f.w}×${f.h} ${f.w >= f.h ? 'paisagem' : 'retrato'}, ${kb} KB, larguras ${f.larguras.join('/')}${f.exif?.tecnica ? ' · ' + f.exif.tecnica : ' · sem EXIF'}`);
        fotos.push(f);
      } else if (EXT_VIDEO.includes(ext)) {
        videos.push(processarVideo(src, pasta, videosAntes[slugify(basename(a, ext))]));
      } else console.log(`   – ${a}: formato não suportado (use JPG, PNG, WebP, MP4, MOV).`);
    } catch (e) {
      console.log(`   ✗ ${a}: ${e.message}`);
      if (/OneDrive|EIO|EBUSY|ENOENT/i.test(e.message)) console.log('     (arquivo "somente online" no OneDrive? Abra-o uma vez para baixar e rode de novo.)');
    }
  }
}

// mantém a ordem anterior (você pode reordenar em data/fotos.js) e acrescenta os novos no fim
const ordem = Object.keys(fotosAntes);
fotos.sort((a, b) => (ordem.indexOf(a.id) + 1 || 1e6) - (ordem.indexOf(b.id) + 1 || 1e6));
for (const id of ordem) if (!fotos.find((f) => f.id === id)) console.log(`⚠ ${id} saiu da lista (o original não está mais em fotos-entrada).`);

const cab = (v) => `/* GERADO por scripts/processar-fotos.mjs — pode editar alt, legenda, sensivel e a ORDEM; o resto é recalculado. */\nwindow.${v} = `;
writeFileSync(join(SITE, 'data', 'fotos.js'), cab('NK_FOTOS') + JSON.stringify(fotos, null, 1) + ';\n');
writeFileSync(join(SITE, 'data', 'videos.js'), cab('NK_VIDEOS') + JSON.stringify(videos, null, 1) + ';\n');

// Open Graph: capa de cada categoria + home (1ª foto do hero)
const porId = Object.fromEntries(fotos.map((f) => [f.id, f]));
if (existsSync(join(SITE, 'assets', 'brand', 'nk-monograma-branco.png'))) {
  for (const c of config.categorias) if (c.capa && porId[c.capa]) gerarOG(porId[c.capa], c.slug);
  const h = (config.home.hero || []).map((id) => porId[id]).find((f) => f && !f.sensivel);
  if (h) gerarOG(h, 'home');
}

const cont = {};
for (const f of fotos) cont[f.categoria] = (cont[f.categoria] || 0) + 1;
console.log('\nResumo por categoria:', cont);
console.log(`Fotos: ${fotos.length} · Vídeos: ${videos.length}. Agora rode: node scripts/gerar-paginas.mjs`);
