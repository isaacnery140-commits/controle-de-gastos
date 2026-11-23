// Juntos: ler a fatura do cartão (PDF, planilha, CSV, OFX ou texto colado), conferir e importar.
// A leitura é a mesma do app Controle de Gastos (src/fatura.js), com as categorias do Juntos.
const isoYMD = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
const fimMes = (y, m) => new Date(y, m + 1, 0).getDate();
// Categoria do dicionário de lojas -> categoria do Juntos
const FX_PARA = {'iFood / Delivery':'Alimentação','Assinaturas':'Contas','Tarifas do cartão':'Contas','Combustível':'Transporte','Transporte':'Transporte',
  'Compras':'Compras','Casa (itens)':'Casa','Mercado (comida)':'Mercado','Restaurantes':'Alimentação','Saúde':'Saúde','Contas':'Contas','Lazer':'Lazer','Educação':'Educação','Moradia':'Casa'};
const FX_DIC=[
 ['iFood / Delivery',['IFOOD','IFD ','RAPPI','ZE DELIVERY','ZEDELIVERY','AIQFOME','UBER EATS','UBEREATS','99FOOD','99 FOOD','DELIVERY','JAMES DELIVERY','DELIVERY MUCH']],
 ['Assinaturas',['NETFLIX','SPOTIFY','PRIME VIDEO','PRIMEVIDEO','AMAZON PRIME','AMAZONPRIME','AMAZON MUSIC','DISNEY','HBO','MAX COM','GLOBOPLAY','YOUTUBE','APPLE COM','APPLECOMBILL','ITUNES','GOOGLE ONE','GOOGLE STORAGE','GOOGLE PLAY','MICROSOFT','DEEZER','PARAMOUNT','CRUNCHYROLL','CLAUDE AI','ANTHROPIC','OPENAI','CHATGPT','CANVA','DROPBOX','ICLOUD','GAME PASS','PLAYSTATION PLUS','PS PLUS','SMART FIT','SMARTFIT','BLUEFIT','GYMPASS','WELLHUB','TOTALPASS','ACADEMIA','KINDLE UNLIMITED','AUDIBLE','TELECINE','STAR PLUS','DAZN','PREMIERE']],
 ['Tarifas do cartão',['IOF','ANUIDADE','JUROS','ENCARGO','MULTA ','TARIFA','SEGURO CARTAO','PROTECAO CARTAO','AVAL EMERG','SAQUE']],
 ['Combustível',['POSTO','AUTO POSTO','AUTOPOSTO','SHELL','IPIRANGA','PETROBRAS','BR MANIA','ALE COMB','COMBUST','GNV ','RAIZEN','PETRO ','GASOLINA','ETANOL','ALCOOL ','DIESEL','ABASTEC']],
 ['Transporte',['UBER','99APP','99 APP','99 TAXI','99POP','99 POP','CABIFY','INDRIVE','ESTACION','ESTAPAR','SEM PARAR','SEMPARAR','CONECTCAR','VELOE','PEDAGIO','METRO ','ONIBUS','BILHETE UNICO','LOCALIZA','MOVIDA','UNIDAS','OFICINA','MECANICA','AUTO PECAS','AUTOPECAS','PNEU','LAVA JATO','LAVAJATO','DETRAN','IPVA','ZONA AZUL','BLABLACAR','BUSER','RODOVIARIA','CLICKBUS']],
 ['Compras',['MERCADOLIVRE','MERCADO LIVRE','MERCADOLIVR','AMAZON','AMZN','MAGALU','MAGAZINE LUIZA','MAGAZINELUIZA','MAGAZ LUIZA','SHOPEE','SHEIN','ALIEXPRESS','ALIPAY','AMERICANAS','SUBMARINO','RENNER','RIACHUELO','C A ','C&A','CEA ','ZARA','HERING','NETSHOES','CENTAURO','DECATHLON','KABUM','CASAS BAHIA','CASASBAHIA','PONTO FRIO','PONTOFRIO','FAST SHOP','TEMU','HAVAIANAS','NIKE','ADIDAS','BOTICARIO','NATURA','SEPHORA','AVON','EUDORA','MARISA','PERNAMBUCANAS','DAFITI','CALCADOS','MODA','BOUTIQUE','PERFUMARIA','OTICA','RELOJOARIA','ELETRONIC','INFORMATICA','CELULAR','TV ','TELEVISAO','NOTEBOOK','COMPUTADOR','FONE ','ROUPA','TENIS ','SAPATO','PRESENTE']],
 ['Casa (itens)',['LEROY','TELHANORTE','C C ','CASA VIDEO','CASA E VIDEO','TOK STOK','TOKSTOK','TOK&STOK','ETNA','CAMICADO','MADEIRAMADEIRA','MOBLY','FERRAGEM','FERRAGENS','MAT CONSTR','MATERIAIS DE CONST','MATERIAL DE CONST','MAT DE CONST','CONSTRUCAO','HOME CENTER','UTILIDADES','UTILIDADE','ARMARINHO','PAPELARIA','PET ','PETZ','COBASI','PETLOVE','AGROPECUARIA','PRODUTOS DE LIMPEZA','ELETRICA','HIDRAULICA','TINTAS','VIDRACARIA','COLCHAO','COLCHOES','MOVEIS','DECORA','CAMA MESA','ENXOVAL','JARDIM','FLORICULTURA','CHAVEIRO','LAVANDERIA','DOMESTICA','DIARISTA','BAZAR','1 99','R 1 99','LOJA DE 1','GELADEIRA','FOGAO','SOFA ','MICROONDAS','MAQUINA DE LAVAR','PANELA','CORTINA','TAPETE','LAMPADA','PRODUTO DE LIMPEZA','VASSOURA']],
 ['Mercado (comida)',['SUPERMERC','SUPERMERCADO','SUPERMERCADOS','MERCADO','MERCADINHO','MERCEARIA','MINIMERCADO','MINI MERCADO','ATACAD','ASSAI','CARREFOUR','PAO DE ACUCAR','EXTRA ','HORTIFRUTI','HORTI','SACOLAO','ACOUGUE','CASA DE CARNE','CASA DE CARNES','CARNES','PADARIA','PANIFICADORA','PANIFIC','EMPORIO','QUITANDA','FEIRA','MAKRO','SAMS CLUB','FORT ATAC','COMPER','BRETAS','MUFFATO','ZAFFARI','SAVEGNAGO','GUANABARA','CONDOR','ANGELONI','SONDA','HIROTA','OXXO','NATURAL DA TERRA','DIST BEBIDAS','DISTRIBUIDORA','BEBIDAS','LATICINIO','FRIGORIFICO','PEIXARIA','ST MARCHE','DIA BRASIL','GIASSI','BIG BOMPRECO','BOMPRECO','NORDESTAO','ATACADISTA','SUPER ','HIPER']],
 ['Restaurantes',['RESTAUR','RESTAURANTE','LANCH','LANCHONETE','PIZZ','BURGER','HAMBURG','MC DONALDS','MCDONALDS','MCDONALD','BK ','BURGER KING','SUBWAY','OUTBACK','HABIBS','GIRAFFAS','SPOLETO','CAFE ','CAFETERIA','COFFEE','BAR ','BOTECO','CHURRASC','SUSHI','TEMAKI','JAPONES','SORVET','ACAI','PASTEL','CONFEITARIA','DOCERIA','STARBUCKS','CHOPP','CERVEJARIA','ESPETINHO','GRILL','BISTRO','PASTELARIA','COCO BAMBU','MADERO','CHINA IN BOX','KFC','POPEYES','JERONIMO','BOB S','BOBS','DOMINOS','CANTINA','TAPIOCA','CREPE','SALGADOS','FOOD ']],
 ['Saúde',['DROGA','DROGARIA','FARMA','FARMACIA','RAIA','PACHECO','PAGUE MENOS','PANVEL','DROGASIL','NISSEI','SAO JOAO FARM','LABORAT','CLINICA','CLINIC','HOSPITAL','ODONTO','UNIMED','HAPVIDA','AMIL','BRADESCO SAUDE','SULAMERICA','MEDIC','PSICO','FISIO','DENTIST','EXAME','CONSULTORIO','VETERIN']],
 ['Contas',['VIVO','CLARO','TIM ','OI ','ENEL','CEMIG','COPEL','SABESP','LIGHT ','CPFL','ENERGISA','CELESC','COELBA','CELPE','EQUATORIAL','NEOENERGIA','COMGAS','NATURGY','SANEPAR','EMBASA','COPASA','CAGECE','CEDAE','NET SERV','SKY ','INTERNET','TELECOM','FIBRA','RECARGA','CONTA DE LUZ','LUZ ','AGUA ','ENERGIA','GAS ','TELEFONE']],
 ['Lazer',['CINEMA','CINEMARK','CINEPOLIS','KINOPLEX','UCI ','INGRESSO','SYMPLA','EVENTIM','TICKET','STEAM','PLAYSTATION','PSN','XBOX','NINTENDO','EPIC GAMES','RIOT','HOTEL','POUSADA','BOOKING','AIRBNB','DECOLAR','LATAM','GOL LINHAS','AZUL LINHAS','123MILHAS','MAXMILHAS','PARQUE','CLUBE','SHOW ','TEATRO','MUSEU','VIAGEM','TURISMO','BOLICHE','KARAOKE','BALADA']],
 ['Educação',['ESCOLA','COLEGIO','FACULD','UNIVERS','CURSO','UDEMY','ALURA','COURSERA','DUOLINGO','LIVRARIA','SARAIVA','ESTANTE VIRTUAL','KINDLE','APOSTILA','MENSALIDADE']],
 ['Moradia',['ALUGUEL','CONDOMINIO','CONDOM','IPTU','IMOBILIARIA','QUINTOANDAR','QUINTO ANDAR']],
];
const PREFIXOS=/^(?:MP|MERCADOPAGO|MERCPAGO|PAG|PAGSEGURO|PG|EC|PICPAY|SUMUP|STONE|CIELO|IZ|SQ|PAYPAL|EBN|DL|HNA|EBANX|GETNET|REDE|TON|INFINITEPAY|IFD|PP|BR|NUPAY|APP)\s*\*\s*/;
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9*&]+/g,' ').replace(/\s+/g,' ').trim();
const RX_PARC=/\b(?:PARC(?:ELA)?\.?\s*)?(\d{1,2})\s?(?:\/|DE)\s?(\d{1,2})\b/;
const RX_TERMOS = FX_DIC.map(([cat, ts]) => [FX_PARA[cat] || 'Outros', new RegExp(ts.map(t => { const exato = /\s$/.test(t), e = t.trim().replace(/[.*+?^${}()|[\]\\&]/g, m => m === '&' ? '&' : '\\' + m);
  return '(?:^|[^A-Z0-9])' + e + (exato ? '(?![A-Z0-9])' : ''); }).join('|'))]);
function catDaLoja(desc) {
  const n = ' ' + norm(desc).replace(PREFIXOS, '').replace(/\*/g, ' ') + ' ';
  for (const [cat, rx] of RX_TERMOS) if (rx.test(n)) return cat;
  return 'Outros';
}
const bonito = s => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s*\/-])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase()) : s; };
const MESABR={JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12};
const RX_ITEM=/(?:^|\s)(\d{1,2})(?:[\/.\-](\d{1,2})(?:[\/.\-](\d{4}|\d{2}))?|\s(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[A-Z]*\.?(?:\s(\d{4}))?)\s+(\S.*?)\s+(?:(-|−)\s?)?(?:R\$\s?)?(?:(-|−)\s?)?(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2})(?:\s?(-|D|C)(?![A-Za-z]))?(?=\s|$)/gi;
const RX_LIXO=/^(TOTAL|SUBTOTAL|SALDO|LIMITE|VALOR|PAGAMENTO MINIMO|MINIMO|VENCIMENTO|FATURA|ENCARGOS? (DE|PARA)|TAXA|CET|JUROS (DO|DE) ROTATIVO|PROXIMA FATURA|DATA|PERIODO|LANCAMENTOS|RESUMO|CREDITOS E|DEMONSTRATIVO)/;
const RX_CREDITO=/PAGAMENTO|PAGTO|PGTO|ESTORNO|CREDITO|DEVOLU|REEMBOLSO|CASHBACK|AJUSTE A CRED|DESCONTO/;
const valorBR=s=>parseFloat(s.replace(/\./g,'').replace(',','.'));

function itensDoTexto(linhas){const out=[];let total=null,venc=null;
  for(const bruta of linhas){const ln=bruta.replace(/[•·∙●*]{2,}\s*\d{4}/g,' ').replace(/\s+/g,' ').trim(),N=norm(ln);
    if(!venc){const m=N.match(/VENCIMENTO(?: EM| DA FATURA)?\s*:?\s*(\d{2}) (\d{2}) (\d{4})/)||N.match(/VENCIMENTO\D{0,20}(\d{2}) (JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[A-Z]* (\d{4})/);
      if(m){const mo=MESABR[m[2]]||+m[2];if(mo>=1&&mo<=12)venc=isoYMD(+m[3],mo-1,+m[1]);}}
    if(total===null){const m=N.match(/TOTAL (?:DA |DESTA |A PAGAR |DE )?(?:SUA )?FATURA(?: ATUAL)?\D{0,15}(\d{1,3}(?: \d{3})* \d{2})\b/);
      if(m)total=parseFloat(m[1].replace(/ (\d{2})$/,'.$1').replace(/ /g,''));}
    for(const m of ln.matchAll(RX_ITEM)){const [,d,mo,y,mab,y2,desc,s1,s2,val,s3]=m;
      const dia=+d,mes=mab?MESABR[mab.toUpperCase().slice(0,3)]:+mo;if(!(dia>=1&&dia<=31&&mes>=1&&mes<=12))continue;
      const dn=norm(desc);if(dn.length<2||/^\d+$/.test(dn.replace(/ /g,''))||RX_LIXO.test(dn))continue;
      const valor=valorBR(val);if(!(valor>0))continue;
      const neg=!!(s1||s2||(s3&&s3!=='D'));
      let ano=y||y2?+(y||y2):null;if(ano&&ano<100)ano+=2000;
      out.push({dia,mes,ano,desc:desc.replace(/\s+/g,' ').trim(),valor,credito:neg||RX_CREDITO.test(dn)});}}
  return {itens:out,total,venc};}

function lerCSV(txt){const linhas=txt.replace(/^﻿/,'').split(/\r?\n/).filter(l=>l.trim());if(linhas.length<2)return [];
  const sep=(linhas[0].match(/;/g)||[]).length>=(linhas[0].match(/,/g)||[]).length?';':',';
  const split=l=>{const r=[];let c='',q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===sep&&!q){r.push(c);c='';}else c+=ch;}r.push(c);return r.map(x=>x.trim());};
  const h=split(linhas[0]).map(norm);
  const iD=h.findIndex(x=>/^DATA|DATE/.test(x)),iT=h.findIndex(x=>/DESCRI|TITLE|TITULO|ESTABELEC|HISTORICO|LANCAMENTO|MEMO|NOME/.test(x)),iV=h.findIndex(x=>/VALOR|AMOUNT|VALUE|QUANTIA/.test(x));
  if(iD<0||iT<0||iV<0)return [];
  const rows=linhas.slice(1).map(split).map(c=>{const ds=c[iD]||'';let dia,mes,ano;let m;
    if(m=ds.match(/(\d{4})-(\d{2})-(\d{2})/))[ano,mes,dia]=[+m[1],+m[2],+m[3]];else if(m=ds.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/)){dia=+m[1];mes=+m[2];ano=m[3]?+m[3]:null;if(ano&&ano<100)ano+=2000;}else return null;
    let vs=(c[iV]||'').replace(/[R$\s]/g,'');const n=vs.includes(',')?parseFloat(vs.replace(/\./g,'').replace(',','.')):parseFloat(vs);if(!isFinite(n)||!n)return null;
    return {dia,mes,ano,desc:c[iT]||'',n};}).filter(Boolean);
  return comSinal(rows);}
function lerOFX(txt){const rows=[];for(const b of txt.split(/<STMTTRN>/i).slice(1)){const g=t=>{const m=b.match(new RegExp('<'+t+'>([^<\\r\\n]*)','i'));return m?m[1].trim():'';};
    const dt=g('DTPOSTED'),n=parseFloat(g('TRNAMT').replace(',','.'));if(!/^\d{8}/.test(dt)||!isFinite(n)||!n)continue;
    rows.push({ano:+dt.slice(0,4),mes:+dt.slice(4,6),dia:+dt.slice(6,8),desc:g('MEMO')||g('NAME'),n});}
  return comSinal(rows);}
function comSinal(rows){ // se a maioria é negativa, compras vêm negativas (padrão OFX); senão positivas (CSV do Nubank)
  const negMaioria=rows.filter(r=>r.n<0).length>rows.length/2;
  return rows.map(r=>({dia:r.dia,mes:r.mes,ano:r.ano,desc:String(r.desc).trim(),valor:Math.abs(Math.round(r.n*100)/100),credito:(negMaioria?r.n>0:r.n<0)||RX_CREDITO.test(norm(r.desc))}));}

let XLSXLIB=null;
async function lerPlanilha(f){if(!XLSXLIB){await new Promise((ok,err)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=ok;s.onerror=()=>err(new Error('Não consegui carregar o leitor de planilhas. Verifique a internet.'));document.head.append(s);});XLSXLIB=window.XLSX;}
  const wb=XLSXLIB.read(new Uint8Array(await f.arrayBuffer()),{type:'array',cellDates:false});
  for(const nome of wb.SheetNames){const csv=XLSXLIB.utils.sheet_to_csv(wb.Sheets[nome],{FS:';',blankrows:false});
    const linhas=csv.split('\n');const ini=linhas.findIndex(l=>/data|date/i.test(l)&&/valor|amount|value/i.test(l));
    if(ini>=0){const itens=lerCSV(linhas.slice(ini).join('\n'));if(itens.length)return itens;}
    const r=itensDoTexto(linhas.map(l=>l.replace(/;/g,' ')));if(r.itens.length)return r.itens;}
  return [];}


// ===================== tela: anexar fatura =====================
function dataCompra(it, venc) {
  if (it.ano) return isoYMD(it.ano, it.mes - 1, Math.min(it.dia, fimMes(it.ano, it.mes - 1)));
  const [vy, vm, vd] = venc.split('-').map(Number); let ano = vy;
  if (it.mes > vm || (it.mes === vm && it.dia > vd + 5)) ano--;
  return isoYMD(ano, it.mes - 1, Math.min(it.dia, fimMes(ano, it.mes - 1)));
}
function adivinharCartao(arquivo) {
  const n = norm(arquivo);
  const b = ['NUBANK','ITAU','INTER','BRADESCO','SANTANDER','CAIXA','BANCO DO BRASIL','C6','PICPAY','MERCADO PAGO','NEON','PAN','PORTO','XP','BTG','SICOOB','SICREDI','NEXT','WILL','DIGIO','AMERICANAS','CARREFOUR','RIACHUELO','RENNER'].find(x => n.includes(x));
  return b ? bonito(b) : '';
}
const brlC = v => brl(v).replace(/\s/g, ' ');

async function abrirFaturas() {
  $('fx-err').textContent = ''; $('fx-senha-box').hidden = true; $('fx-senha').value = ''; $('fx-colar-box').hidden = true; $('fx-arq').value = '';
  abrir('s-fat');
  const {data} = await sb.from('juntos_faturas').select('*').eq('dono', S.espaco).order('vencimento', {ascending:false}).limit(12);
  $('fx-lista-tit').hidden = !(data && data.length);
  $('fx-lista').innerHTML = (data || []).map(f => `
    <div class="fx-item" data-id="${f.id}">
      <div class="m"><b>💳 ${esc(f.cartao || 'Cartão')}</b><div class="s">vence ${esc(f.vencimento.split('-').reverse().slice(0, 2).join('/'))} · ${f.modo === 'total' ? 'total' : f.qtd + ' compras'}</div></div>
      <b>${brl(f.total)}</b>
      <button class="x" aria-label="Remover fatura">✕</button>
    </div>`).join('');
  $('fx-lista').querySelectorAll('.fx-item').forEach(el => el.querySelector('.x').onclick = async () => {
    if (!confirm('Remover esta fatura e os lançamentos dela?')) return;
    const {error} = await sb.from('juntos_faturas').delete().eq('id', el.dataset.id);
    if (error) { aviso('Não foi possível remover'); return; }
    aviso('Fatura removida'); carregarGastos(); abrirFaturas();
  });
}
$('b-fatura').onclick = abrirFaturas;
$('fx-colar').onclick = () => { $('fx-colar-box').hidden = false; $('fx-texto').focus(); };
$('fx-arq').onchange = () => { if ($('fx-arq').files[0]) lerArquivo(); };
$('fx-ler-senha').onclick = () => lerArquivo();
$('fx-ler-texto').onclick = () => {
  const txt = $('fx-texto').value;
  let r = itensDoTexto(txt.split(/\r?\n/));
  if (!r.itens.length) { const c = lerCSV(txt); if (c.length) r = {itens:c, total:null, venc:null}; }
  if (!r.itens.length) { $('fx-err').textContent = 'Não achei compras nesse texto. Cada compra precisa ter data, nome e valor na mesma linha (ex.: 12/10 IFOOD 45,90).'; return; }
  abrirRevisao('', r);
};
async function lerArquivo() {
  const f = $('fx-arq').files[0]; if (!f) return;
  $('fx-err').textContent = ''; $('fx-status').textContent = 'Lendo ' + f.name + '…';
  try {
    let r; const nome = f.name.toLowerCase();
    if (nome.endsWith('.pdf') || f.type === 'application/pdf') {
      let linhas;
      try { linhas = await pdfLinhas(new Uint8Array(await f.arrayBuffer()), $('fx-senha').value); }
      catch (e) {
        if (e && e.name === 'PasswordException') { $('fx-senha-box').hidden = false; $('fx-senha').focus(); throw new Error($('fx-senha').value ? 'Senha errada. Muitos bancos usam os primeiros dígitos do CPF.' : 'Esse PDF tem senha (muitos bancos usam os primeiros dígitos do CPF).'); }
        throw e;
      }
      r = itensDoTexto(linhas);
      if (!r.itens.length) throw new Error(linhas.join('').trim().length < 50 ? 'Esse PDF é uma imagem, sem texto. Baixe o PDF original no app do banco ou exporte em CSV/OFX.' : 'Não achei compras nesse PDF. Tente o CSV/OFX do banco ou cole o texto da fatura.');
    } else if (/\.(xlsx?|ods)$/.test(nome)) {
      const itens = await lerPlanilha(f);
      if (!itens.length) throw new Error('Não achei compras nessa planilha (precisa de data, descrição e valor).');
      r = {itens, total:null, venc:null};
    } else if ((f.type || '').startsWith('image/') || /\.(jpe?g|png|heic|webp)$/.test(nome)) {
      throw new Error('Foto ou print da fatura ainda não dá para ler. Use o PDF, o CSV/OFX do banco, ou cole o texto.');
    } else {
      const txt = await f.text(); let itens = /<OFX>|<STMTTRN>/i.test(txt) ? lerOFX(txt) : lerCSV(txt), rr = null;
      if (!itens.length) { rr = itensDoTexto(txt.split(/\r?\n/)); itens = rr.itens; }
      if (!itens.length) throw new Error('Não reconheci esse arquivo. Use o PDF, a planilha/CSV/OFX do banco, ou cole o texto.');
      r = {itens, total:rr ? rr.total : null, venc:rr ? rr.venc : null};
    }
    abrirRevisao(f.name, r);
  } catch (e) { $('fx-err').textContent = e.message || String(e); }
  finally { $('fx-status').textContent = ''; }
}

// ---------- conferência ----------
let REV = null;
async function abrirRevisao(arquivo, r) {
  const hoje = new Date();
  const venc = r.venc || isoYMD(hoje.getFullYear(), hoje.getMonth(), Math.min(10, fimMes(hoje.getFullYear(), hoje.getMonth())));
  REV = {totalPdf:r.total, itens:r.itens.map((x, i) => ({...x, i, sel:!x.credito || !/PAGAMENTO|PAGTO|PGTO/.test(norm(x.desc)), cat:x.credito ? 'Outros' : catDaLoja(x.desc), nome:bonito(x.desc.replace(/^\s*[A-Za-z]{1,12}\s*\*\s*(?=\S)/, m => /^(?:MP|MERCADOPAGO|MERCPAGO|PAG|PAGSEGURO|PG|EC|PICPAY|SUMUP|STONE|CIELO|IZ|SQ|PAYPAL|EBN|DL|HNA|EBANX|GETNET|REDE|TON|INFINITEPAY|IFD|PP|BR|NUPAY|APP)\s*\*/i.test(m) ? '' : m).replace(/\*/g, ' '))}))};
  // pagamento da fatura anterior não entra
  REV.itens.forEach(x => { if (x.credito && /PAGAMENTO|PAGTO|PGTO/.test(norm(x.desc))) x.sel = false; });
  $('rv-cartao').value = adivinharCartao(arquivo);
  $('rv-venc').value = venc;
  document.querySelector('input[name=rv-modo][value=itens]').checked = true;
  fechar('s-fat');
  $('rev').hidden = false; document.body.classList.add('travado');
  await marcarRepetidos();
  desenharRevisao();
}
async function marcarRepetidos() {
  const venc = $('rv-venc').value;
  REV.itens.forEach(x => { x.dc = dataCompra(x, venc); x.dup = false; });
  const ds = REV.itens.map(x => x.dc).sort();
  const {data} = await sb.from('juntos_lancamentos').select('data_compra,valor,descricao').eq('dono', S.espaco).not('fatura_id', 'is', null).gte('data_compra', ds[0]).lte('data_compra', ds[ds.length - 1]);
  const ja = new Set((data || []).map(l => l.data_compra + '|' + Number(l.valor).toFixed(2) + '|' + norm(l.descricao).slice(0, 30)));
  REV.itens.forEach(x => { if (ja.has(x.dc + '|' + x.valor.toFixed(2) + '|' + norm(x.nome).slice(0, 30))) { x.dup = true; x.sel = false; } });
}
const somaRev = () => Math.round(REV.itens.filter(x => x.sel).reduce((s, x) => s + (x.credito ? -x.valor : x.valor), 0) * 100) / 100;
function desenharRevisao() {
  const opc = sel => CATS.despesa.map(([c, i]) => `<option value="${esc(c)}"${c === sel ? ' selected' : ''}>${i} ${esc(c)}</option>`).join('');
  $('rv-lista').innerHTML = REV.itens.map(x => `
    <div class="rv-item${x.sel ? '' : ' off'}" data-i="${x.i}">
      <span class="ck">${x.sel ? '✓' : ''}</span>
      <div class="m">
        <div class="t">${esc(x.nome)}</div>
        <div class="s">${esc(x.dc.split('-').reverse().slice(0, 2).join('/'))}${x.credito ? ' · <span class="in">crédito</span>' : ''}${x.dup ? ' · <span class="dup">já importada</span>' : ''}</div>
        ${x.credito ? '' : `<select class="rv-cat">${opc(x.cat)}</select>`}
      </div>
      <div class="v ${x.credito ? 'in' : ''}">${x.credito ? '− ' : ''}${brl(x.valor)}</div>
    </div>`).join('');
  $('rv-lista').querySelectorAll('.rv-item').forEach(el => {
    const x = REV.itens[+el.dataset.i];
    el.onclick = e => { if (e.target.closest('select')) return; x.sel = !x.sel; el.classList.toggle('off', !x.sel); el.querySelector('.ck').textContent = x.sel ? '✓' : ''; resumoRev(); };
    const s = el.querySelector('.rv-cat');
    if (s) { s.onchange = () => { x.cat = s.value; // aplica nas outras compras da mesma loja
      const k = norm(x.nome).split(' ').slice(0, 2).join(' ');
      REV.itens.forEach(o => { if (o !== x && !o.credito && norm(o.nome).split(' ').slice(0, 2).join(' ') === k) o.cat = s.value; });
      desenharRevisao(); }; }
  });
  resumoRev();
}
function resumoRev() {
  const sel = REV.itens.filter(x => x.sel), tot = somaRev(), modo = document.querySelector('input[name=rv-modo]:checked').value;
  $('rv-resumo').textContent = sel.length + ' de ' + REV.itens.length + ' itens · ' + brl(tot) + (REV.totalPdf ? ' (fatura: ' + brl(REV.totalPdf) + ')' : '');
  $('rv-ok').textContent = 'Importar ' + brl(tot);
  $('rv-ok').disabled = !(tot > 0);
  $('rv-lista').classList.toggle('so-total', modo === 'total');
}
document.querySelectorAll('input[name=rv-modo]').forEach(r => r.onchange = resumoRev);
$('rv-venc').onchange = async () => { await marcarRepetidos(); desenharRevisao(); };
$('rv-todos').onclick = () => { const marcar = REV.itens.some(x => !x.sel); REV.itens.forEach(x => x.sel = marcar); desenharRevisao(); };
const fecharRev = () => { $('rev').hidden = true; document.body.classList.remove('travado'); REV = null; };
$('rv-fechar').onclick = fecharRev;
$('rv-ok').onclick = async () => {
  const venc = $('rv-venc').value, cartao = $('rv-cartao').value.trim().slice(0, 40), modo = document.querySelector('input[name=rv-modo]:checked').value;
  const sel = REV.itens.filter(x => x.sel), tot = somaRev();
  if (!venc || !(tot > 0)) return;
  const b = $('rv-ok'); b.disabled = true; b.textContent = 'Importando…';
  try {
    const {data:fat, error} = await sb.from('juntos_faturas').insert({dono:S.espaco, cartao, vencimento:venc, total:tot, qtd:sel.length, modo}).select().single();
    if (error) throw error;
    const linhas = modo === 'total'
      ? [{dono:S.espaco, tipo:'despesa', valor:tot, descricao:('Fatura ' + (cartao || 'do cartão')).slice(0, 120), categoria:'Contas', data:venc, fatura_id:fat.id}]
      : sel.map(x => ({dono:S.espaco, tipo:x.credito ? 'receita' : 'despesa', valor:x.valor, descricao:((x.credito ? 'Estorno: ' : '') + x.nome).slice(0, 120),
          categoria:x.credito ? 'Outros' : x.cat, data:venc, data_compra:x.dc, fatura_id:fat.id}));
    for (let i = 0; i < linhas.length; i += 200) {
      const {error:e2} = await sb.from('juntos_lancamentos').insert(linhas.slice(i, i + 200));
      if (e2) { await sb.from('juntos_faturas').delete().eq('id', fat.id); throw e2; }
    }
    fecharRev();
    const d = deISO(venc); S.gAno = d.getFullYear(); S.gMes = d.getMonth();
    await carregarGastos();
    aviso('Fatura importada: ' + brl(tot), 'Desfazer', async () => { await sb.from('juntos_faturas').delete().eq('id', fat.id); aviso('Importação desfeita'); carregarGastos(); });
  } catch (e) { aviso('Não foi possível importar'); b.disabled = false; resumoRev(); }
};

// ===================== relatório do mês =====================
let RA = 0, RM = 0;
$('b-rel').onclick = () => { RA = S.gAno; RM = S.gMes; abrirRel(); };
$('rl-fechar').onclick = () => { $('rel').hidden = true; document.body.classList.remove('travado'); };
$('rl-ant').onclick = () => { if (--RM < 0) { RM = 11; RA--; } abrirRel(); };
$('rl-prox').onclick = () => { if (++RM > 11) { RM = 0; RA++; } abrirRel(); };
let REL_TXT = '';
async function abrirRel() {
  $('rel').hidden = false; document.body.classList.add('travado');
  $('rl-mes').textContent = nomeMes(RA, RM);
  $('rl-corpo').innerHTML = '<div class="vazio">Carregando…</div>';
  const de = iso(new Date(RA, RM - 3, 1)), ate = iso(new Date(RA, RM + 1, 0)), ini = iso(new Date(RA, RM, 1));
  const [{data:L, error}, {data:F}] = await Promise.all([
    sb.from('juntos_lancamentos').select('tipo,valor,descricao,categoria,data,criado_por,fatura_id').eq('dono', S.espaco).gte('data', de).lte('data', ate),
    sb.from('juntos_faturas').select('cartao,total,vencimento').eq('dono', S.espaco).gte('vencimento', ini).lte('vencimento', ate)
  ]);
  if (error) { $('rl-corpo').innerHTML = '<div class="vazio">Sem conexão</div>'; return; }
  const mesDe = l => { const d = deISO(l.data); return (d.getFullYear() - RA) * 12 + d.getMonth() - RM; }; // 0 = este mês, -1 anterior…
  const doMes = L.filter(l => mesDe(l) === 0), ant = L.filter(l => mesDe(l) === -1), prev = L.filter(l => mesDe(l) < 0);
  const soma = (arr, t) => arr.filter(l => l.tipo === t).reduce((s, l) => s + Number(l.valor), 0);
  const ent = soma(doMes, 'receita'), sai = soma(doMes, 'despesa'), saiAnt = soma(ant, 'despesa');
  const nPrev = new Set(prev.map(mesDe)).size || 1;
  const porCat = {}, mediaCat = {};
  doMes.filter(l => l.tipo === 'despesa').forEach(l => porCat[l.categoria] = (porCat[l.categoria] || 0) + Number(l.valor));
  prev.filter(l => l.tipo === 'despesa').forEach(l => mediaCat[l.categoria] = (mediaCat[l.categoria] || 0) + Number(l.valor) / nPrev);
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const maiores = doMes.filter(l => l.tipo === 'despesa').sort((a, b) => b.valor - a.valor).slice(0, 5);
  const porPessoa = {};
  doMes.filter(l => l.tipo === 'despesa').forEach(l => { const k = l.criado_por || '?'; porPessoa[k] = (porPessoa[k] || 0) + Number(l.valor); });
  const nomeDe = id => id === S.eu.id ? 'Você' : (S.nomes[id] || 'Outra pessoa');
  const pct = (a, b) => b > 0 ? Math.round((a - b) / b * 100) : null;
  const seta = p => p === null ? '' : p > 0 ? `<span class="out">▲ ${p}%</span>` : p < 0 ? `<span class="in">▼ ${-p}%</span>` : '<span class="muted">=</span>';
  const pSai = pct(sai, saiAnt);
  if (!doMes.length) { $('rl-corpo').innerHTML = '<div class="vazio">Nenhum lançamento neste mês</div>'; REL_TXT = ''; return; }
  let h = `
    <div class="resumo">
      <div class="card"><div class="k">Entradas</div><div class="v in">${brl(ent)}</div></div>
      <div class="card"><div class="k">Saídas</div><div class="v out">${brl(sai)}</div></div>
      <div class="card saldo"><div class="k">Saldo</div><div class="v ${ent - sai < 0 ? 'out' : 'in'}">${brl(ent - sai)}</div></div>
    </div>
    ${saiAnt > 0 ? `<div class="card rl-linha"><span>Saídas vs ${esc(nomeMes(RM ? RA : RA - 1, (RM + 11) % 12).split(' ')[0].toLowerCase())}</span><b>${brl(saiAnt)} ${seta(pSai)}</b></div>` : ''}
    <div class="sec-tit">Por categoria</div>
    <div class="card">${cats.map(([c, v]) => { const m = mediaCat[c] || 0, p = pct(v, m);
      return `<div class="cat"><div class="l"><span>${icone('despesa', c)} ${esc(c)} <small class="muted">${Math.round(v / sai * 100)}%</small></span><b>${brl(v)}</b></div>
        <div class="bar"><span style="width:${Math.max(3, v / cats[0][1] * 100)}%"></span></div>
        ${m > 0 ? `<div class="rl-media">média ${brl(m)} ${seta(p)}</div>` : ''}</div>`; }).join('')}</div>
    <div class="sec-tit">Maiores gastos</div>
    <div class="card">${maiores.map(l => `<div class="rl-linha"><span>${icone('despesa', l.categoria)} ${esc(l.descricao || l.categoria)} <small class="muted">${esc(l.data.split('-').reverse().slice(0, 2).join('/'))}</small></span><b>${brl(l.valor)}</b></div>`).join('')}</div>`;
  if (F && F.length) h += `<div class="sec-tit">Faturas do cartão</div><div class="card">${F.map(f => `<div class="rl-linha"><span>💳 ${esc(f.cartao || 'Cartão')} <small class="muted">vence ${esc(f.vencimento.split('-').reverse().slice(0, 2).join('/'))}</small></span><b>${brl(f.total)}</b></div>`).join('')}</div>`;
  if (Object.keys(porPessoa).length > 1) h += `<div class="sec-tit">Quem lançou</div><div class="card">${Object.entries(porPessoa).sort((a, b) => b[1] - a[1]).map(([id, v]) => `<div class="rl-linha"><span>${esc(nomeDe(id))}</span><b>${brl(v)}</b></div>`).join('')}</div>`;
  $('rl-corpo').innerHTML = h;
  REL_TXT = `Relatório ${nomeMes(RA, RM)}\nEntradas: ${brl(ent)}\nSaídas: ${brl(sai)}${pSai !== null ? ` (${pSai > 0 ? '+' : ''}${pSai}% vs mês anterior)` : ''}\nSaldo: ${brl(ent - sai)}\n\nPor categoria:\n`
    + cats.map(([c, v]) => `• ${c}: ${brl(v)} (${Math.round(v / sai * 100)}%)`).join('\n')
    + `\n\nMaiores gastos:\n` + maiores.map(l => `• ${l.descricao || l.categoria}: ${brl(l.valor)}`).join('\n');
}
$('rl-share').onclick = async () => {
  if (!REL_TXT) return;
  try { if (navigator.share) { await navigator.share({title:'Relatório ' + nomeMes(RA, RM), text:REL_TXT}); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(REL_TXT); aviso('Relatório copiado'); } catch (e) { aviso('Não foi possível compartilhar'); }
};
$('rl-print').onclick = () => window.print();
