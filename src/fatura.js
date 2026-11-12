// ===================== separação automática por item =====================
// Ordem importa: o primeiro grupo que casar ganha (ex.: "UBER EATS" é delivery antes de "UBER" ser transporte).
// Termo com espaço no fim = palavra exata; sem espaço = começo de palavra.
const DICIONARIO=[
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
// prefixos de maquininha/intermediador que escondem o nome da loja
const PREFIXOS=/^(?:MP|MERCADOPAGO|MERCPAGO|PAG|PAGSEGURO|PG|EC|PICPAY|SUMUP|STONE|CIELO|IZ|SQ|PAYPAL|EBN|DL|HNA|EBANX|GETNET|REDE|TON|INFINITEPAY|IFD|PP|BR|NUPAY|APP)\s*\*\s*/;
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9*&]+/g,' ').replace(/\s+/g,' ').trim();
const RX_PARC=/\b(?:PARC(?:ELA)?\.?\s*)?(\d{1,2})\s?(?:\/|DE)\s?(\d{1,2})\b/;
function chave(desc){let s=norm(desc).replace(PREFIXOS,'');
  s=s.replace(/\bPARC(?:ELA)?\b/g,' ').replace(/\b\d{1,2}\s?(?:\/|DE)\s?\d{1,2}\b/g,' ').replace(/\*/g,' ').replace(/\b\d+\b/g,' ').replace(/\s+/g,' ').trim();
  return s.split(' ').slice(0,3).join(' ').slice(0,40);}
const RX_TERMOS=DICIONARIO.map(([cat,ts])=>[cat,new RegExp(ts.map(t=>{const exato=/\s$/.test(t),e=t.trim().replace(/[.*+?^${}()|[\]\\&]/g,m=>m==='&'?'&':'\\'+m);
  return '(?:^|[^A-Z0-9])'+e+(exato?'(?![A-Z0-9])':'');}).join('|'))]);
let REGRAS=[];
async function carregarRegras(){const {data}=await sb.from('gastos_regras').select('termo,categoria_id');REGRAS=(data||[]).sort((a,b)=>b.termo.length-a.termo.length);}
function catPorNome(nome,tipo){return CATS.find(c=>c.tipo===tipo&&c.nome===nome);}
function catPadrao(tipo){return catPorNome(tipo==='despesa'?'Diversos':'Outros',tipo)||catPorNome('Outros',tipo)||CATS.find(c=>c.tipo===tipo);}
function sugerirCat(desc,tipo='despesa'){const k=chave(desc);
  if(k){const r=REGRAS.find(r=>k===r.termo||k.startsWith(r.termo+' '));if(r&&catPorId(r.categoria_id)?.tipo===tipo)return {cat:catPorId(r.categoria_id),fonte:'regra'};}
  if(tipo==='despesa'){const n=' '+norm(desc).replace(/\*/g,' ')+' ';
    for(const [nome,rx] of RX_TERMOS){if(rx.test(n)){const c=catPorNome(nome,tipo);if(c)return {cat:c,fonte:'dicionario'};}}}
  return {cat:catPadrao(tipo),fonte:'padrao'};}
async function aprender(pares){ // [{desc,categoria_id}] -> regras do usuário
  const m=new Map();pares.forEach(p=>{const k=chave(p.desc);if(k.length>=2&&p.categoria_id)m.set(k,p.categoria_id);});
  if(!m.size)return;const rows=[...m].map(([termo,categoria_id])=>({user_id:USER.id,termo,categoria_id}));
  const {error}=await sb.from('gastos_regras').upsert(rows,{onConflict:'user_id,termo'});
  if(!error){rows.forEach(r=>{const i=REGRAS.findIndex(x=>x.termo===r.termo);if(i>=0)REGRAS[i]=r;else REGRAS.push(r);});REGRAS.sort((a,b)=>b.termo.length-a.termo.length);}}
const bonito=s=>{s=String(s||'').replace(/\s+/g,' ').trim();return s===s.toUpperCase()?s.toLowerCase().replace(/(^|[\s*\/-])([a-zà-ú])/g,(m,a,b)=>a+b.toUpperCase()):s;};

// ===================== leitura da fatura =====================
let PDFJS=null;
async function carregarPdfJs(){if(PDFJS)return PDFJS;
  await new Promise((ok,err)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    s.onload=ok;s.onerror=()=>err(new Error('Não consegui carregar o leitor de PDF. Verifique a internet.'));document.head.append(s);});
  PDFJS=window.pdfjsLib;PDFJS.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';return PDFJS;}
async function pdfLinhas(buf,senha){const lib=await carregarPdfJs();
  const doc=await lib.getDocument({data:buf,password:senha||undefined}).promise;const linhas=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p),tc=await pg.getTextContent();
    const its=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({s:i.str,x:i.transform[4],y:i.transform[5],w:i.width||0}));
    its.sort((a,b)=>b.y-a.y||a.x-b.x);const grupos=[];
    for(const it of its){let g=grupos.find(g=>Math.abs(g.y-it.y)<3);if(!g){g={y:it.y,its:[]};grupos.push(g);}g.its.push(it);}
    grupos.sort((a,b)=>b.y-a.y);
    for(const g of grupos){g.its.sort((a,b)=>a.x-b.x);let t='',fim=null;
      for(const it of g.its){if(fim!==null){const gap=it.x-fim;t+=gap>40?'   ':gap>1.2?' ':'';}t+=it.s;fim=it.x+it.w;}
      linhas.push(t);}}
  return linhas;}

const MESABR={JAN:1,FEV:2,MAR:3,ABR:4,MAI:5,JUN:6,JUL:7,AGO:8,SET:9,OUT:10,NOV:11,DEZ:12};
const RX_ITEM=/(?:^|\s)(\d{1,2})(?:[\/.\-](\d{1,2})(?:[\/.\-](\d{4}|\d{2}))?|\s(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[A-Z]*\.?(?:\s(\d{4}))?)\s+(\S.*?)\s+(?:(-|−)\s?)?(?:R\$\s?)?(?:(-|−)\s?)?(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2})(?:\s?(-|D|C)(?![A-Za-z]))?(?=\s|$)/gi;
const RX_LIXO=/^(TOTAL|SUBTOTAL|SALDO|LIMITE|VALOR|PAGAMENTO MINIMO|MINIMO|VENCIMENTO|FATURA|ENCARGOS? (DE|PARA)|TAXA|CET|JUROS (DO|DE) ROTATIVO|PROXIMA FATURA|DATA|PERIODO|LANCAMENTOS|RESUMO|CREDITOS E|DEMONSTRATIVO)/;
const RX_CREDITO=/PAGAMENTO|PAGTO|PGTO|ESTORNO|CREDITO|DEVOLU|REEMBOLSO|CASHBACK|AJUSTE A CRED|DESCONTO/;
const valorBR=s=>parseFloat(s.replace(/\./g,'').replace(',','.'));

function itensDoTexto(linhas){const out=[];let total=null,venc=null;
  for(const bruta of linhas){const ln=bruta.replace(/[•·∙●*]{2,}\s*\d{4}/g,' ').replace(/\s+/g,' ').trim(),N=norm(ln);
    if(!venc){const m=N.match(/VENCIMENTO(?: EM| DA FATURA)?\s*:?\s*(\d{2}) (\d{2}) (\d{4})/)||N.match(/VENCIMENTO\D{0,20}(\d{2}) (JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[A-Z]* (\d{4})/);
      if(m){const mo=MESABR[m[2]]||+m[2];if(mo>=1&&mo<=12)venc=iso(+m[3],mo-1,+m[1]);}}
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

// ===================== tela de conferência =====================
let REV=null; // {arquivo,itens:[...],totalPdf,venc}
function dataCompra(it,venc){if(it.ano)return iso(it.ano,it.mes-1,Math.min(it.dia,fimMes(it.ano,it.mes-1)));
  const [vy,vm,vd]=venc.split('-').map(Number);let ano=vy;if(it.mes>vm||(it.mes===vm&&it.dia>vd+5))ano--;
  return iso(ano,it.mes-1,Math.min(it.dia,fimMes(ano,it.mes-1)));}

$('fx-ler').onclick=async()=>{msg('fx-msg');const f=$('fx-arq').files[0];if(!f)return msg('fx-msg','Escolha o arquivo da fatura primeiro.','warn');
  const b=$('fx-ler');b.disabled=true;b.textContent='Lendo…';
  try{let r;const nome=f.name.toLowerCase();
    if(nome.endsWith('.pdf')||f.type==='application/pdf'){
      let linhas;try{linhas=await pdfLinhas(new Uint8Array(await f.arrayBuffer()),$('fx-senha').value);}
      catch(e){if(e&&e.name==='PasswordException'){$('w-senha').hidden=false;$('fx-senha').focus();throw new Error($('fx-senha').value?'Senha do PDF incorreta. Muitos bancos usam os primeiros dígitos do CPF.':'Esse PDF tem senha. Digite a senha (muitos bancos usam os primeiros dígitos do CPF) e clique em "Ler fatura" de novo.');}throw e;}
      r=itensDoTexto(linhas);
      if(!r.itens.length)throw new Error(linhas.join('').trim().length<50?'Esse PDF parece ser uma imagem escaneada, sem texto. Baixe a fatura direto do app ou site do banco (PDF original), ou exporte em CSV/OFX.':'Não encontrei compras nesse PDF. Se puder, me mande essa fatura para eu ajustar a leitura para o seu banco, ou exporte em CSV/OFX.');}
    else{const txt=await f.text();const itens=/<OFX>|<STMTTRN>/i.test(txt)?lerOFX(txt):lerCSV(txt);
      if(!itens.length)throw new Error('Não reconheci as colunas desse arquivo. Ele precisa ter data, descrição e valor.');r={itens,total:null,venc:null};}
    abrirRevisao(f.name,r);
  }catch(e){msg('fx-msg',erroPT(e));}
  finally{b.disabled=false;b.textContent='Ler fatura';}};

async function abrirRevisao(arquivo,r){
  const venc=r.venc||(()=>{const d=new Date();return iso(d.getFullYear(),d.getMonth(),Math.min(10,d.getDate()));})();
  const itens=r.itens.map((it,i)=>{const p=it.desc.toUpperCase().match(RX_PARC);const parc=p&&+p[1]>=1&&+p[1]<=+p[2]&&+p[2]>=2&&+p[2]<=48?[+p[1],+p[2]]:null;
    const tipo=it.credito?'receita':'despesa',s=sugerirCat(it.desc,tipo);
    return {...it,i,parc,sel:!it.credito,cat:s.cat?.id||'',sug:s.cat?.id||'',fonte:s.fonte,desc2:bonito(it.desc)};});
  // parcelas repetidas da mesma compra (seção "próximas faturas"): fica só a de menor número
  const grupos={};itens.filter(x=>x.parc).forEach(x=>{const k=chave(x.desc)+'|'+x.valor+'|'+x.parc[1];(grupos[k]=grupos[k]||[]).push(x);});
  Object.values(grupos).forEach(g=>{if(g.length>1){g.sort((a,b)=>a.parc[0]-b.parc[0]);g.slice(1).forEach(x=>{x.sel=false;x.futura=true;});}});
  REV={arquivo,itens,totalPdf:r.total,detectouVenc:!!r.venc};
  $('rev-venc').value=venc;$('rev-modo').value='venc';$('rev-q').value='';
  await marcarDuplicados();renderRevisao();$('rev').hidden=false;document.body.classList.add('travado');}
async function marcarDuplicados(){if(!REV)return;const venc=$('rev-venc').value;REV.itens.forEach(x=>{x.dc=dataCompra(x,venc);x.dup=false;});
  const ds=REV.itens.map(x=>x.dc).sort();if(!ds.length)return;
  const {data}=await sb.from('gastos_lancamentos').select('data_compra,valor,descricao').eq('origem','fatura').gte('data_compra',ds[0]).lte('data_compra',ds[ds.length-1]);
  const cont={};(data||[]).forEach(l=>{const k=l.data_compra+'|'+Number(l.valor).toFixed(2)+'|'+chave(l.descricao);cont[k]=(cont[k]||0)+1;});
  REV.itens.forEach(x=>{const k=x.dc+'|'+x.valor.toFixed(2)+'|'+chave(x.desc);if(cont[k]>0){cont[k]--;x.dup=true;x.sel=false;}});}
function opcoesCat(tipo,sel){return CATS.filter(c=>c.tipo===tipo).map(c=>`<option value="${c.id}"${c.id===sel?' selected':''}>${esc(c.icone+'  '+c.nome)}</option>`).join('');}
function renderRevisao(){const R=REV,q=norm($('rev-q').value);
  const vis=R.itens.filter(x=>!q||norm(x.desc2).includes(q));
  $('rev-tit').textContent='Conferir fatura · '+R.arquivo;
  $('rev-lista').innerHTML=vis.map(x=>{const tipo=x.credito?'receita':'despesa';const badges=[
      x.credito?'<span class="tag">pagamento / crédito</span>':'',x.parc?`<span class="tag info">parcela ${x.parc[0]}/${x.parc[1]}</span>`:'',
      x.dup?'<span class="tag">já importado</span>':'',x.futura?'<span class="tag">parcela futura?</span>':'',
      x.fonte==='padrao'&&!x.credito?'<span class="tag">confira a categoria</span>':''].join('');
    const [y,m,d]=x.dc.split('-');
    return `<li class="rv${x.sel?'':' off'}" data-i="${x.i}">
      <input type="checkbox" ${x.sel?'checked':''} aria-label="Importar ${esc(x.desc2)}">
      <div class="rv-tx"><input class="rv-desc" value="${esc(x.desc2)}" maxlength="120" aria-label="Descrição"><span class="rv-meta">${d}/${m}/${y} ${badges}</span></div>
      <span class="rv-v ${x.credito?'pos':'neg'}">${x.credito?'+':'−'} ${fmt(x.valor)}</span>
      <select class="rv-cat" aria-label="Categoria">${opcoesCat(tipo,x.cat)}</select></li>`;}).join('')||'<li class="vazio">Nada com esse filtro.</li>';
  resumoRevisao();}
function resumoRevisao(){const R=REV,sel=R.itens.filter(x=>x.sel),desp=sel.filter(x=>!x.credito),cred=sel.filter(x=>x.credito);
  const tot=desp.reduce((s,x)=>s+x.valor,0)-cred.reduce((s,x)=>s+x.valor,0);
  const por={};desp.forEach(x=>por[x.cat]=(por[x.cat]||0)+x.valor);
  $('rev-cats').innerHTML=Object.entries(por).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=catPorId(k)||{nome:'?',cor:'#888'};
    return `<span class="chip"><i class="dot" style="background:${esc(c.cor)}"></i>${esc(c.nome)} <b class="mono">${fmt(v)}</b></span>`;}).join('');
  const n=R.itens.length,nd=R.itens.filter(x=>x.dup).length;
  $('rev-info').textContent=`Encontrei ${n} lançamento(s) no arquivo${nd?`, ${nd} já importado(s) antes`:''}. Confira as categorias. O que você mudar, eu aprendo para as próximas faturas.`;
  $('rev-tot').innerHTML=`<b>${sel.length}</b> selecionado(s) · <b class="mono">${fmt(tot)}</b>`+(R.totalPdf?` · total na fatura: <span class="mono">${fmt(R.totalPdf)}</span>`+(Math.abs(R.totalPdf-tot)<0.05?' <span class="pos">✓ confere</span>':''):'');
  $('rev-ok').textContent=sel.length?`Importar ${sel.length} lançamento(s)`:'Nada selecionado';$('rev-ok').disabled=!sel.length;}
$('rev-lista').addEventListener('change',e=>{const li=e.target.closest('.rv');if(!li)return;const x=REV.itens[+li.dataset.i];
  if(e.target.type==='checkbox'){x.sel=e.target.checked;li.classList.toggle('off',!x.sel);}
  else if(e.target.classList.contains('rv-cat')){x.cat=e.target.value;x.fonte='usuario';
    // aplica a mesma categoria nas outras linhas do mesmo estabelecimento que ainda não foram mexidas
    const k=chave(x.desc);let n=0;REV.itens.forEach(o=>{if(o!==x&&o.fonte!=='usuario'&&!o.credito&&chave(o.desc)===k){o.cat=x.cat;n++;}});if(n){renderRevisao();toast(`Também mudei ${n} outra(s) compra(s) de "${x.desc2}".`);}}
  else if(e.target.classList.contains('rv-desc'))x.desc2=e.target.value;
  resumoRevisao();});
$('rev-q').addEventListener('input',renderRevisao);
$('rev-todos').onclick=()=>{REV.itens.forEach(x=>{if(!x.credito&&!x.dup)x.sel=true;});renderRevisao();};
$('rev-nenhum').onclick=()=>{REV.itens.forEach(x=>x.sel=false);renderRevisao();};
$('rev-venc').addEventListener('change',async()=>{await marcarDuplicados();renderRevisao();});
const fecharRev=()=>{$('rev').hidden=true;document.body.classList.remove('travado');REV=null;};
$('rev-fechar').onclick=fecharRev;$('rev-cancel').onclick=fecharRev;

$('rev-ok').onclick=async()=>{const R=REV,venc=$('rev-venc').value,modo=$('rev-modo').value;if(!venc)return toast('Informe o vencimento da fatura.');
  const sel=R.itens.filter(x=>x.sel);if(!sel.length)return;const b=$('rev-ok');b.disabled=true;b.textContent='Importando…';
  try{const total=sel.reduce((s,x)=>s+(x.credito?-x.valor:x.valor),0);
    const imp=await sb.from('gastos_importacoes').insert({arquivo:R.arquivo.slice(0,200),vencimento:venc,qtd:sel.length,total:Math.round(total*100)/100}).select().single();
    if(imp.error)throw imp.error;const pago=venc<=hojeISO();
    const linhas=sel.map(x=>({tipo:x.credito?'receita':'despesa',valor:x.valor,descricao:(x.desc2||x.desc).slice(0,120),
      data:modo==='compra'&&!x.parc?x.dc:venc,data_compra:x.dc,categoria_id:x.cat||null,forma:'credito',pago,origem:'fatura',importacao_id:imp.data.id}));
    for(let i=0;i<linhas.length;i+=200){const r=await sb.from('gastos_lancamentos').insert(linhas.slice(i,i+200));if(r.error){await sb.from('gastos_importacoes').delete().eq('id',imp.data.id);throw r.error;}}
    await aprender(sel.filter(x=>!x.credito&&x.cat&&x.cat!==x.sug).map(x=>({desc:x.desc,categoria_id:x.cat})));
    fecharRev();$('fx-arq').value='';
    const [y,m]=(modo==='compra'?sel.map(x=>x.dc).sort().pop():venc).split('-').map(Number);MES={y,m:m-1};
    toast(`${linhas.length} lançamento(s) importado(s).`);novoForm();await carregarMes();carregarImportacoes();
    $('sec-cat').scrollIntoView({behavior:'smooth'});
  }catch(e){toast(erroPT(e));b.disabled=false;resumoRevisao();}};

async function carregarImportacoes(){const {data}=await sb.from('gastos_importacoes').select('*').order('criado_em',{ascending:false}).limit(8);
  const el=$('fx-hist');if(!data||!data.length){el.innerHTML='';return;}
  el.innerHTML='<h2 style="margin-top:4px">Faturas importadas</h2><ul class="imps">'+data.map(i=>`<li data-id="${i.id}"><span><b>${esc(i.arquivo||'fatura')}</b><br><span class="hint">venc. ${i.vencimento?i.vencimento.split('-').reverse().join('/'):'–'} · ${i.qtd} itens · <span class="mono">${fmt(i.total)}</span></span></span><button class="small danger" type="button">Desfazer</button></li>`).join('')+'</ul>';}
$('fx-hist').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.conf!=='1'){b.dataset.conf='1';b.textContent='Apagar os lançamentos?';setTimeout(()=>{b.dataset.conf='';b.textContent='Desfazer';},3500);return;}
  const {error}=await sb.from('gastos_importacoes').delete().eq('id',b.closest('li').dataset.id);
  if(error)return toast(erroPT(error));toast('Importação desfeita.');carregarImportacoes();carregarMes();});

// ===================== relatório do mês =====================
function abrirRelatorio(){const L=doMes(),desp=L.filter(l=>l.tipo==='despesa'),rec=L.filter(l=>l.tipo==='receita');
  const tD=desp.reduce((s,l)=>s+l.valor,0),tR=rec.reduce((s,l)=>s+l.valor,0);
  const ant=[1,2,3].map(n=>doMes(shiftMes(MES,-n)).filter(l=>l.tipo==='despesa'));const temAnt=ant.filter(a=>a.length).length;
  const porCat={};desp.forEach(l=>{const k=l.categoria_id||'_';(porCat[k]=porCat[k]||[]).push(l);});
  const media=k=>temAnt?ant.reduce((s,a)=>s+a.filter(l=>(l.categoria_id||'_')===k).reduce((t,l)=>t+l.valor,0),0)/temAnt:null;
  const cats=Object.entries(porCat).map(([k,ls])=>({k,c:catPorId(k)||{nome:'Sem categoria',cor:'#8a948e',icone:'•'},ls:ls.sort((a,b)=>a.data.localeCompare(b.data)||b.valor-a.valor),t:ls.reduce((s,l)=>s+l.valor,0)})).sort((a,b)=>b.t-a.t);
  const est={};desp.forEach(l=>{const k=chave(l.descricao)||'(sem descrição)';const e=est[k]=est[k]||{n:0,t:0,nome:bonito(l.descricao.replace(RX_PARC,'').replace(/\(\d+\/\d+\)/,'').trim())||k,cat:l.categoria_id};e.n++;e.t+=l.valor;});
  const ests=Object.values(est).sort((a,b)=>b.t-a.t).slice(0,20);
  const dt=s=>s.split('-').reverse().slice(0,2).join('/');
  const varia=(t,m)=>m==null||!m?'<td class="hint">–</td>':`<td class="${t>m?'neg':'pos'}">${t>m?'+':''}${Math.round((t-m)/m*100)}%</td>`;
  const nomeMes=MESES[MES.m]+' de '+MES.y;
  $('rel-corpo').innerHTML=`
   <div class="rel-cab"><div><h1>Relatório de <span>${nomeMes}</span></h1><div class="sub">${esc(USER?.email||'')} · gerado em ${new Date().toLocaleDateString('pt-BR')}</div></div></div>
   <div class="cards">
     <div class="card"><span class="k">Receitas</span><span class="v pos">${fmt(tR)}</span></div>
     <div class="card"><span class="k">Despesas</span><span class="v neg">${fmt(tD)}</span></div>
     <div class="card saldo"><span class="k">Saldo</span><span class="v ${tR-tD<0?'neg':'pos'}">${fmt(tR-tD)}</span></div>
     <div class="card"><span class="k">Lançamentos</span><span class="v">${L.length}</span></div></div>
   <h2>Gastos por categoria</h2>
   <table class="tab"><thead><tr><th>Categoria</th><th class="n">Itens</th><th class="n">Total</th><th class="n">% do mês</th><th class="n">Média ${temAnt?temAnt+' mês(es) ant.':'ant.'}</th><th class="n">Variação</th><th class="n">Orçamento</th></tr></thead><tbody>
   ${cats.map(({k,c,ls,t})=>{const m=media(k),o=Number(c.orcamento)||0;return `<tr><td><i class="dot" style="background:${esc(c.cor)}"></i> ${esc(c.nome)}</td><td class="n">${ls.length}</td><td class="n mono"><b>${fmt(t)}</b></td><td class="n">${tD?Math.round(t/tD*100):0}%</td><td class="n mono">${m==null?'–':fmt(m)}</td>${varia(t,m)}<td class="n ${o&&t>o?'neg':''}">${o?fmt(o):'–'}</td></tr>`;}).join('')||'<tr><td colspan="7" class="hint">Nenhuma despesa neste mês.</td></tr>'}
   </tbody><tfoot><tr><td>Total</td><td class="n">${desp.length}</td><td class="n mono"><b>${fmt(tD)}</b></td><td class="n">100%</td><td></td><td></td><td></td></tr></tfoot></table>
   <h2>Onde você mais gastou</h2>
   <table class="tab tab-est"><thead><tr><th>Estabelecimento</th><th>Categoria</th><th class="n">Vezes</th><th class="n">Total</th></tr></thead><tbody>
   ${ests.map(e=>`<tr><td>${esc(e.nome)}</td><td>${esc(catPorId(e.cat)?.nome||'–')}</td><td class="n">${e.n}</td><td class="n mono">${fmt(e.t)}</td></tr>`).join('')||'<tr><td colspan="4" class="hint">–</td></tr>'}
   </tbody></table>
   <h2>Detalhe de cada categoria</h2>
   ${cats.map(({c,ls,t})=>`<div class="rel-cat"><h3><i class="dot" style="background:${esc(c.cor)}"></i> ${esc(c.nome)} <span class="mono">${fmt(t)}</span></h3>
     <table class="tab tab-det"><tbody>${ls.map(l=>`<tr><td class="d">${dt(l.data_compra||l.data)}</td><td>${esc(l.descricao||c.nome)}${l.pago?'':' <span class="tag">a pagar</span>'}</td><td>${FORMAS[l.forma]||''}</td><td class="n mono">${fmt(l.valor)}</td></tr>`).join('')}</tbody></table></div>`).join('')}
   ${rec.length?`<h2>Receitas</h2><table class="tab"><tbody>${rec.sort((a,b)=>a.data.localeCompare(b.data)).map(l=>`<tr><td class="d">${dt(l.data)}</td><td>${esc(l.descricao||catPorId(l.categoria_id)?.nome||'')}</td><td>${esc(catPorId(l.categoria_id)?.nome||'')}</td><td class="n mono pos">${fmt(l.valor)}</td></tr>`).join('')}</tbody></table>`:''}`;
  $('rel').hidden=false;document.body.classList.add('travado');$('rel').scrollTop=0;}
$('b-rel').onclick=abrirRelatorio;
$('rel-fechar').onclick=()=>{$('rel').hidden=true;document.body.classList.remove('travado');};
$('rel-imprimir').onclick=()=>window.print();
$('rel-csv').onclick=()=>{$('q').value='';$('q-cat').value='';$('q-tipo').value='';renderLista();$('b-csv').click();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('rel').hidden)$('rel-fechar').click();else if(!$('rev').hidden)fecharRev();}});
