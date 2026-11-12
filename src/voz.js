// ===================== lançamento por voz / frase rápida =====================
const NUMS={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,quatorze:14,catorze:14,quinze:15,
  dezesseis:16,dezessete:17,dezoito:18,dezenove:19,vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90,cem:100,cento:100,
  duzentos:200,duzentas:200,trezentos:300,trezentas:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900,mil:1000};
const semAcento=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function palavrasParaNumeros(t){ // "cento e vinte e cinco reais" -> "125 reais"
  const tk=t.split(/(\s+)/),out=[];let i=0;
  while(i<tk.length){const w=semAcento(tk[i]);
    if(NUMS[w]===undefined){out.push(tk[i]);i++;continue;}
    let total=0,cur=0,j=i,ult=i,ultimo=Infinity;
    while(j<tk.length){const x=semAcento(tk[j]);
      if(/^\s+$/.test(tk[j])){j++;continue;}
      if(NUMS[x]!==undefined){if(x==='mil'){total+=(cur||1)*1000;cur=0;ultimo=1000;}else{if(NUMS[x]>=ultimo&&ultimo<1000)break;cur+=NUMS[x];ultimo=NUMS[x];}ult=j;j++;continue;}
      if(x==='e'){let k=j+1;while(k<tk.length&&/^\s+$/.test(tk[k]))k++;const nx=k<tk.length?NUMS[semAcento(tk[k])]:undefined;if(nx!==undefined&&(nx<ultimo||ultimo>=1000)&&semAcento(tk[k])!=='mil'){j=k;continue;}}
      break;}
    const grupo=tk.slice(i,ult+1).map(semAcento).filter(x=>x.trim()&&x!=='e');
    if(grupo.every(x=>x==='um'||x==='uma')){let k=ult+1;while(k<tk.length&&/^\s+$/.test(tk[k]))k++;const prox=k<tk.length?semAcento(tk[k]):'';
      if(!/^(reais|real|mil|centavos?|conto|pila)/.test(prox)){out.push(tk[i]);i++;continue;}}
    out.push(String(total+cur));i=ult+1;}
  return out.join('');}
function numBR(s){s=s.trim();if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s))return parseFloat(s.replace(/\./g,'').replace(',','.'));
  if(/,\d{1,2}$/.test(s))return parseFloat(s.replace(/\./g,'').replace(',','.'));if(/^\d+\.\d{1,2}$/.test(s))return parseFloat(s);return parseFloat(s.replace(/[.,]/g,''));}
const RECEITA_PALAVRAS=/\b(recebi|receber|ganhei|lucro|lucrei|salario|entrada|entrou|vendi|venda|vendas|receita|caiu na conta|me pagaram|me pagou|freela|bico|reembolso)\b/;
function entenderFrase(frase){
  let t=palavrasParaNumeros(' '+frase+' ').replace(/\s+/g,' ');const s=semAcento(t);
  const r={tipo:RECEITA_PALAVRAS.test(s)?'receita':'despesa',valor:null,parc:1,forma:null,data:hojeISO(),pago:true,desc:''};
  let resto=t;const tira=re=>{resto=resto.replace(re,' ');};
  // parcelas: "em 3 vezes", "3x", "10 parcelas"
  let m=semAcento(resto).match(/(?:em\s+)?(\d{1,2})\s*(?:x|vezes|parcelas)\b(\s+de\b)?/);if(m&&+m[1]>=2&&+m[1]<=24){r.parc=+m[1];r.porParcela=!!m[2];r.forma='credito';tira(new RegExp('(?:em\\s+)?'+m[1]+'\\s*(?:x|vezes|parcelas)\\b','i'));}
  const S=()=>semAcento(resto);
  // data
  const d=new Date();let mm2;
  if(mm2=S().match(/\banteontem\b/)){d.setDate(d.getDate()-2);resto=cortaIgual(resto,mm2.index,mm2[0].length);}
  else if(mm2=S().match(/\bontem\b/)){d.setDate(d.getDate()-1);resto=cortaIgual(resto,mm2.index,mm2[0].length);}
  else if(mm2=S().match(/\bhoje\b/)){resto=cortaIgual(resto,mm2.index,mm2[0].length);}
  else if(mm2=S().match(/\bdia (\d{1,2})\b/)){const dd=+mm2[1];if(dd>=1&&dd<=31){d.setDate(Math.min(dd,fimMes(d.getFullYear(),d.getMonth())));resto=cortaIgual(resto,mm2.index,mm2[0].length);}}
  r.data=iso(d.getFullYear(),d.getMonth(),d.getDate());
  // valor
  const pats=[/r\$\s*(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?:\s*e\s*(\d{1,2})\s*centavos?)?/i,
    /(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:reais|real|conto|contos|pila|pilas)\b(?:\s*e\s*(\d{1,2})(?:\s*centavos?)?)?/i,
    /(?:^|\s)(\d+)\s+e\s+(\d{1,2})(?:\s*centavos?)?(?=\s|$)/i,
    /(?:^|\s)(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?)(?=\s|$)/];
  for(const p of pats){const mm=resto.match(p);if(mm){r.valor=Math.round((numBR(mm[1])+(mm[2]?+mm[2]/100:0))*100)/100;resto=resto.replace(mm[0],' ');break;}}
  // forma de pagamento
  const formas=[['pix',/\b(?:no |pelo |via |de )?pix\b/],['debito',/\b(?:no |de |pelo )?(?:cartao de )?debito\b/],['credito',/\b(?:no |de |pelo )?(?:cartao(?: de credito)?|credito)\b/],['dinheiro',/\b(?:em |no )?(?:dinheiro|especie)\b/],['boleto',/\b(?:no |de |pelo )?boleto\b/]];
  for(const [f,re] of formas){const mm=S().match(re);if(mm){r.forma=r.forma||f;resto=cortaIgual(resto,mm.index,mm[0].length);break;}}
  if(/\b(a pagar|vou pagar|ainda nao paguei|pendente|vence|vencimento)\b/.test(S())){r.pago=false;resto=resto.replace(/\b(a pagar|vou pagar|ainda n[ãa]o paguei|pendente)\b/gi,' ');}
  // descrição: tira verbos e palavras de ligação
  let desc=semAcento(resto).replace(/\b(controle de gastos?|lancar|lanca|lance|adicionar|adiciona|anota|anotar|registra|registrar|coloca|colocar|gastei|gasto|paguei|pago|comprei|compra de|fiz|foi|deu|recebi|ganhei|lucrei|entrou|caiu na conta|reais|real|centavos?|valor|de|do|da|dos|das|com|no|na|nos|nas|em|pro|pra|para|o|a|os|as|um|uma|e|que|eu|hoje|agora)\b/g,' ').replace(/[.,;:!?]/g,' ').replace(/\s+/g,' ').trim();
  // recupera a grafia original (com acento) das palavras que sobraram
  const orig=resto.replace(/[.,;:!?]/g,' ').split(/\s+/).filter(Boolean),keep=desc.split(' ');
  desc=keep.map(k=>orig.find(o=>semAcento(o)===k)||k).join(' ');
  r.desc=desc?(/^[a-z][A-Z]/.test(desc)?desc:desc.charAt(0).toUpperCase()+desc.slice(1)):'';
  // categoria
  if(r.tipo==='receita'){const nomes=[['Salário',/salario|holerite/],['Vendas',/vend/],['Extra',/lucro|lucrei|freela|bico|extra|reembolso/]];
    const hit=nomes.find(([n,re])=>re.test(s));r.cat=(hit&&catPorNome(hit[0],'receita'))||catPadrao('receita');}
  else{let sug=sugerirCat(r.desc,'despesa');if(sug.fonte==='padrao')sug=sugerirCat(s,'despesa');r.cat=sug.cat;}
  if(!r.desc)r.desc=r.cat?r.cat.nome:'';
  return r;}
function cortaIgual(txt,ini,len){ // remove trecho achado no texto sem acento da mesma posição do texto original (mesmo comprimento)
  return txt.slice(0,ini)+' '.repeat(len)+txt.slice(ini+len);}

async function lancarFrase(frase){frase=String(frase||'').trim();if(!frase)return;
  const r=entenderFrase(frase);
  if(!(r.valor>0)){ // sem valor: preenche o formulário para completar
    novoForm();setTipo(r.tipo);$('f-desc').value=r.desc;if(r.cat){$('f-cat').value=r.cat.id;CAT_TOCADA=true;}if(r.forma)$('f-forma').value=r.forma;$('f-data').value=r.data;
    $('sec-form').scrollIntoView({behavior:'smooth'});$('f-valor').focus({preventScroll:true});
    $('rp-txt').value='';msg('rp-msg','Não entendi o valor. Completei o resto no formulário: digite o valor e toque em Salvar.','warn');return;}
  msg('rp-msg');
  const base={tipo:r.tipo,valor:r.valor,descricao:r.desc.slice(0,120),data:r.data,categoria_id:r.cat?.id||null,forma:r.forma||'pix',pago:r.pago};
  const cent=Math.round(r.valor*100),vParc=r.parc>1&&!r.porParcela?Math.floor(cent/r.parc):cent;
  const linhas=[];for(let i=0;i<r.parc;i++){const v=r.parc>1&&!r.porParcela&&i===r.parc-1?cent-vParc*(r.parc-1):vParc;
    linhas.push({...base,valor:v/100,data:addMes(base.data,i),pago:i===0?base.pago:false,descricao:r.parc>1?`${base.descricao} (${i+1}/${r.parc})`:base.descricao});}
  const {data,error}=await sb.from('gastos_lancamentos').insert(linhas).select('id');
  if(error)return msg('rp-msg',erroPT(error));
  $('rp-txt').value='';
  const [y,m]=r.data.split('-').map(Number);if(y!==MES.y||m-1!==MES.m)MES={y,m:m-1};
  await carregarMes();
  const ids=(data||[]).map(x=>x.id);
  if(ids.length===1&&r.tipo==='despesa'&&await avisarSeNaFatura(ids[0],linhas[0].valor,linhas[0].data,'Lançado.'))return;
  toast(`${r.tipo==='receita'?'Receita':'Despesa'} lançada: ${base.descricao} · ${r.parc>1?r.parc+'x de '+fmt(vParc/100)+' (total '+fmt(r.parc*vParc/100+(cent-vParc*r.parc)/100)+')':fmt(r.valor)} · ${r.cat?.nome||''}`,'Desfazer',async()=>{
    const {error}=await sb.from('gastos_lancamentos').delete().in('id',ids);if(error)return toast(erroPT(error));toast('Lançamento desfeito.');carregarMes();});}

$('rp-form').addEventListener('submit',e=>{e.preventDefault();lancarFrase($('rp-txt').value);});
const Reconhecedor=window.SpeechRecognition||window.webkitSpeechRecognition;
let REC=null,OUVINDO=false;
$('rp-mic').onclick=()=>{
  if(!Reconhecedor){$('rp-txt').focus();return msg('rp-msg','Este navegador não liberou o microfone do app. Toque no campo e use o microfone do teclado 🎤 para ditar, depois toque em Lançar.','warn');}
  if(OUVINDO){REC&&REC.stop();return;}
  REC=new Reconhecedor();REC.lang='pt-BR';REC.interimResults=true;REC.maxAlternatives=1;REC.continuous=false;
  let final='';
  REC.onstart=()=>{OUVINDO=true;$('rp-mic').classList.add('ouvindo');$('rp-mic').setAttribute('aria-label','Parar de ouvir');msg('rp-msg','Pode falar… ex.: "gastei 100 reais no iFood"','ok');};
  REC.onresult=ev=>{let txt='';for(let i=ev.resultIndex;i<ev.results.length;i++){txt+=ev.results[i][0].transcript;if(ev.results[i].isFinal)final+=ev.results[i][0].transcript;}$('rp-txt').value=final||txt;};
  REC.onerror=ev=>{msg('rp-msg',ev.error==='not-allowed'||ev.error==='service-not-allowed'?'O microfone foi bloqueado. Libere o microfone para este site nas configurações do navegador, ou use o microfone do teclado.':ev.error==='no-speech'?'Não ouvi nada. Toque no 🎤 e fale de novo.':'Não consegui ouvir ('+ev.error+'). Tente de novo ou digite.','warn');};
  REC.onend=()=>{OUVINDO=false;$('rp-mic').classList.remove('ouvindo');$('rp-mic').setAttribute('aria-label','Falar um lançamento');
    const t=(final||$('rp-txt').value).trim();if(t){msg('rp-msg');lancarFrase(t);}};
  try{REC.start();}catch(e){msg('rp-msg','Não consegui abrir o microfone: '+e.message,'warn');}};

// ===================== mais formas de importar a fatura =====================
// texto colado (bloco de notas, e-mail, PDF copiado)
$('fx-colar-ler').onclick=()=>{const txt=$('fx-texto').value;if(!txt.trim())return msg('fx-msg','Cole o texto da fatura no campo primeiro.','warn');
  let r=itensDoTexto(txt.split(/\r?\n/));
  if(!r.itens.length){const c=lerCSV(txt);if(c.length)r={itens:c,total:null,venc:null};}
  if(!r.itens.length)return msg('fx-msg','Não encontrei compras nesse texto. Cada compra precisa ter data, descrição e valor na mesma linha (ex.: "12/10 IFOOD 45,90").','warn');
  msg('fx-msg');abrirRevisao('texto colado',r);};
// arrastar o arquivo (PC)
const zona=$('sec-fatura');
['dragenter','dragover'].forEach(ev=>zona.addEventListener(ev,e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){e.preventDefault();zona.classList.add('soltar');}}));
['dragleave','drop'].forEach(ev=>zona.addEventListener(ev,e=>{if(ev==='dragleave'&&zona.contains(e.relatedTarget))return;zona.classList.remove('soltar');}));
zona.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(!f)return;const dt=new DataTransfer();dt.items.add(f);$('fx-arq').files=dt.files;$('fx-arq').dispatchEvent(new Event('change'));$('fx-ler').click();});
$('fx-arq').addEventListener('change',()=>{const f=$('fx-arq').files[0];$('fx-nome').textContent=f?'Arquivo: '+f.name:'';});
// planilha do banco (xls/xlsx)
let XLSXLIB=null;
async function lerPlanilha(f){if(!XLSXLIB){await new Promise((ok,err)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=ok;s.onerror=()=>err(new Error('Não consegui carregar o leitor de planilhas. Verifique a internet.'));document.head.append(s);});XLSXLIB=window.XLSX;}
  const wb=XLSXLIB.read(new Uint8Array(await f.arrayBuffer()),{type:'array',cellDates:false});
  for(const nome of wb.SheetNames){const csv=XLSXLIB.utils.sheet_to_csv(wb.Sheets[nome],{FS:';',blankrows:false});
    const linhas=csv.split('\n');const ini=linhas.findIndex(l=>/data|date/i.test(l)&&/valor|amount|value/i.test(l));
    if(ini>=0){const itens=lerCSV(linhas.slice(ini).join('\n'));if(itens.length)return itens;}
    const r=itensDoTexto(linhas.map(l=>l.replace(/;/g,' ')));if(r.itens.length)return r.itens;}
  return [];}

// ===================== atualização automática =====================
const VERSAO='/*VERSAO*/';
async function checarVersao(){try{const r=await fetch(location.pathname+'?nv='+Date.now(),{cache:'no-store'});const t=await r.text();
  const m=t.match(/const VERSAO='([^']+)'/);if(m&&m[1]!==VERSAO){let ja='';try{ja=sessionStorage.getItem('gastos_atualizou');}catch(e){}if(ja===m[1])return;
    try{sessionStorage.setItem('gastos_atualizou',m[1]);}catch(e){}toast('Nova versão do app. Atualizando…');setTimeout(()=>location.replace(location.pathname+'?v='+encodeURIComponent(m[1])),1200);}}catch(e){}}
checarVersao();document.addEventListener('visibilitychange',()=>{if(!document.hidden)checarVersao();});
