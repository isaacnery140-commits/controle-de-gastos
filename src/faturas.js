// ===================== aba Faturas =====================
let FATURAS=[],FAT_TOT={},FAT_SEL=null,FAT_ITENS=[];
function irPara(aba,semHash){const fat=aba==='faturas';
  $('pg-painel').hidden=fat;$('pg-faturas').hidden=!fat;document.body.classList.toggle('pg-fat',fat);
  document.querySelectorAll('.abas button').forEach(b=>{if(b.dataset.aba===aba)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(!semHash){const h=fat?'#faturas':'#';if(location.hash!==h)history.replaceState(null,'',fat?'#faturas':location.pathname+location.search);}
  if(fat&&USER)carregarFaturas();scrollTo(0,0);}
document.querySelectorAll('.abas button').forEach(b=>b.onclick=()=>irPara(b.dataset.aba));
document.addEventListener('click',e=>{const b=e.target.closest('[data-ir]');if(b)irPara(b.dataset.ir);});
window.addEventListener('hashchange',()=>irPara(location.hash==='#faturas'?'faturas':'painel',true));

const dBR=s=>s?s.split('-').reverse().join('/'):'–';
async function carregarFaturas(){if(!USER)return;
  const [f,t]=await Promise.all([sb.from('gastos_importacoes').select('*').order('vencimento',{ascending:false}),
    sb.from('gastos_lancamentos').select('id,importacao_id,pago,valor').eq('origem','fatura_total')]);
  FATURAS=(f.data||[]).map(x=>({...x,total:Number(x.total)}));FAT_TOT={};(t.data||[]).forEach(l=>{if(l.importacao_id)FAT_TOT[l.importacao_id]=l;});
  const cartoes=[...new Set(FATURAS.map(x=>x.cartao).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  $('cartoes').innerHTML=cartoes.map(c=>`<option value="${esc(c)}">`).join('');
  const fc=$('fl-cartao'),atual=fc.value;fc.length=1;cartoes.forEach(c=>fc.add(new Option(c,c)));fc.value=cartoes.includes(atual)?atual:'';fc.hidden=cartoes.length<2;
  renderFaturas();if(FAT_SEL&&!FATURAS.some(x=>x.id===FAT_SEL))fecharFatura();}
const jaLanc=()=>Math.round(FAT_ITENS.filter(x=>x.ja_lancado&&!x.credito).reduce((s,x)=>s+x.valor,0)*100)/100;
async function ajustarTotalPainel(f){if(f.modo!=='total')return;const t=FAT_TOT[f.id];const v=Math.round((f.total-jaLanc())*100)/100;
  if(t){if(v>0){await sb.from('gastos_lancamentos').update({valor:v}).eq('id',t.id);t.valor=v;}}}
function faturaPaga(f){const t=FAT_TOT[f.id];return t?t.pago:(f.modo==='itens'?null:false);}
function renderFaturas(){const fc=$('fl-cartao').value,L=FATURAS.filter(f=>!fc||f.cartao===fc);
  $('fl-lista').innerHTML=L.length?L.map(f=>{const pg=faturaPaga(f);
    return `<li data-id="${f.id}" class="${f.id===FAT_SEL?'sel':''}" tabindex="0" role="button" aria-label="Abrir fatura ${esc(f.cartao)} de ${dBR(f.vencimento)}">
      <b>💳 ${esc(f.cartao||'Cartão')}</b><span class="fv">${fmt(f.total)}</span>
      <span class="fm">vence ${dBR(f.vencimento)} · ${f.qtd} item(ns)
      ${pg===true?'<span class="tag ok">paga</span>':pg===false?'<span class="tag">a pagar</span>':''}</span></li>`;}).join('')
    :'<li class="vazio" style="display:block;cursor:default">Nenhuma fatura ainda.</li>';}
$('fl-cartao').addEventListener('change',renderFaturas);
$('fl-lista').addEventListener('click',e=>{const li=e.target.closest('li[data-id]');if(li)abrirFatura(li.dataset.id);});
$('fl-lista').addEventListener('keydown',e=>{if(e.key==='Enter'){const li=e.target.closest('li[data-id]');if(li)abrirFatura(li.dataset.id);}});

function fecharFatura(){FAT_SEL=null;FAT_ITENS=[];$('sec-fat-det').hidden=true;renderFaturas();}
async function abrirFatura(id){if($('pg-faturas').hidden)irPara('faturas');
  if(!FATURAS.some(f=>f.id===id))await carregarFaturas();const f=FATURAS.find(x=>x.id===id);if(!f)return toast('Fatura não encontrada.');
  FAT_SEL=id;renderFaturas();
  const {data,error}=await sb.from('gastos_fatura_itens').select('*').eq('importacao_id',id).order('data_compra',{ascending:true});
  if(error)return toast(erroPT(error));
  FAT_ITENS=(data||[]).map(x=>({...x,valor:Number(x.valor)}));
  $('fd-q').value='';$('fd-a-data').value=f.vencimento?addMes(f.vencimento,-1):hojeISO();msg('fd-msg');
  renderFatura();$('sec-fat-det').hidden=false;
  if(matchMedia('(max-width:860px)').matches)$('sec-fat-det').scrollIntoView({behavior:'smooth'});}
function renderFatura(){const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f)return;
  $('fd-tit').textContent=`💳 ${f.cartao||'Cartão'} · vence ${dBR(f.vencimento)}`;
  $('fd-valor').value=valorTx(f.total);$('fd-venc').value=f.vencimento||'';
  const t=FAT_TOT[f.id];$('fd-pago').checked=!!(t&&t.pago);$('fd-pago').disabled=!t;
  $('fd-sem-painel').hidden=!(f.modo==='total'&&!t);
  $('fd-valor').disabled=f.modo==='itens';$('fd-valor').title=f.modo==='itens'?'Nesta fatura o Painel recebe cada compra; o total é a soma dos itens.':'';
  const desp=FAT_ITENS.filter(x=>!x.credito),cred=FAT_ITENS.filter(x=>x.credito);
  const soma=Math.round((desp.reduce((s,x)=>s+x.valor,0)-cred.reduce((s,x)=>s+x.valor,0))*100)/100,falta=Math.round((f.total-soma)*100)/100;
  $('fd-info').innerHTML=(FAT_ITENS.length?`Itens somam <b class="mono">${fmt(soma)}</b>`+(Math.abs(falta)>=0.01&&f.modo==='total'?(falta>0?` · <span class="neg">faltam ${fmt(falta)} sem nome</span>`:` · <span class="neg">itens passam do total em ${fmt(-falta)}</span>`):' · <span class="pos">✓ confere</span>')
      :'');
  const ja=FAT_ITENS.filter(x=>x.ja_lancado&&!x.credito);
  if(ja.length&&f.modo==='total')$('fd-info').innerHTML+=` · <span class="tag link">${ja.length} já estava(m) no Painel: ${fmt(jaLanc())}</span> · a fatura entra no Painel com <b class="mono">${fmt(Math.max(0,f.total-jaLanc()))}</b>`;
  // por categoria
  const por={};desp.forEach(x=>{const k=x.categoria_id||'_';por[k]=(por[k]||0)+x.valor;});
  const tot=desp.reduce((s,x)=>s+x.valor,0),max=Math.max(1,...Object.values(por));
  $('fd-cats').innerHTML=Object.entries(por).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=catPorId(k)||{nome:'Sem categoria',cor:'#8a948e'};
    return `<li data-fcat="${k}" title="Mostrar só ${esc(c.nome)}"><span class="nm"><i class="dot" style="background:${esc(c.cor)}"></i>${esc(c.nome)}</span>
      <span class="track"><span class="fill" style="width:${v/max*100}%;background:${esc(c.cor)}"></span></span>
      <span class="vl">${fmt(v)}<small>${tot?Math.round(v/tot*100):0}%</small></span></li>`;}).join('')||'<li class="vazio" style="display:block">Sem itens detalhados.</li>';
  renderItens();}
function renderItens(){const q=norm($('fd-q').value),fc=$('fd-q').dataset.cat||'';
  const L=FAT_ITENS.filter(x=>(!q||norm(x.descricao).includes(q))&&(!fc||(x.categoria_id||'_')===fc));
  $('fd-itens').innerHTML=L.map(x=>`<tr data-id="${x.id}"><td class="d">${x.data_compra?x.data_compra.split('-').reverse().slice(0,2).join('/'):'–'}</td>
    <td>${esc(x.descricao)}${x.parcela?` <span class="tag info">${esc(x.parcela)}</span>`:''}${x.credito?' <span class="tag">crédito</span>':''}${x.ja_lancado?' <span class="tag link" title="Você já tinha lançado esta compra no Painel">já no Painel</span>':''}</td>
    <td><select class="fi-cat" aria-label="Categoria de ${esc(x.descricao)}"><option value="">Sem categoria</option>${opcoesCat(x.credito?'receita':'despesa',x.categoria_id)}</select></td>
    <td class="n mono ${x.credito?'pos':''}">${x.credito?'+ ':''}${fmt(x.valor)}</td>
    <td><button type="button" class="del" data-fidel="${x.id}" aria-label="Excluir item ${esc(x.descricao)}" title="Excluir item">🗑</button></td></tr>`).join('')
    ||`<tr><td colspan="5" class="hint">${FAT_ITENS.length?'Nada com esse filtro.':'Nenhum item.'}</td></tr>`;
  if(fc){const c=catPorId(fc);$('fd-msg').className='msg ok';$('fd-msg').hidden=false;$('fd-msg').innerHTML=`Mostrando só ${esc(c?c.nome:'sem categoria')}. <button class="small ghost" type="button" id="fd-limpa">Mostrar tudo</button>`;}
  else if($('fd-msg').querySelector('#fd-limpa'))msg('fd-msg');}
$('fd-cats').addEventListener('click',e=>{const li=e.target.closest('li[data-fcat]');if(!li)return;$('fd-q').dataset.cat=li.dataset.fcat;renderItens();});
$('sec-fat-det').addEventListener('click',e=>{if(e.target.id==='fd-limpa'){$('fd-q').dataset.cat='';msg('fd-msg');renderItens();}});
$('fd-q').addEventListener('input',renderItens);

// mudar categoria de um item (e do lançamento ligado, se houver); aprende
$('fd-itens').addEventListener('change',async e=>{if(!e.target.classList.contains('fi-cat'))return;const tr=e.target.closest('tr'),x=FAT_ITENS.find(i=>i.id===tr.dataset.id);
  const cat=e.target.value||null;const {error}=await sb.from('gastos_fatura_itens').update({categoria_id:cat}).eq('id',x.id);if(error)return toast(erroPT(error));
  if(x.lancamento_id)await sb.from('gastos_lancamentos').update({categoria_id:cat}).eq('id',x.lancamento_id);
  x.categoria_id=cat;if(cat&&!x.credito)aprender([{desc:x.descricao,categoria_id:cat}]);
  // mesma loja dentro da fatura
  const k=chave(x.descricao),outros=FAT_ITENS.filter(o=>o!==x&&!o.credito&&chave(o.descricao)===k&&o.categoria_id!==cat);
  for(const o of outros){await sb.from('gastos_fatura_itens').update({categoria_id:cat}).eq('id',o.id);if(o.lancamento_id)await sb.from('gastos_lancamentos').update({categoria_id:cat}).eq('id',o.lancamento_id);o.categoria_id=cat;}
  renderFatura();toast(outros.length?`Categoria trocada em ${outros.length+1} compras de "${x.descricao}".`:'Categoria trocada.');if(x.lancamento_id)carregarMes();});
// excluir item (com desfazer)
$('fd-itens').addEventListener('click',async e=>{const b=e.target.closest('[data-fidel]');if(!b)return;const x=FAT_ITENS.find(i=>i.id===b.dataset.fidel);if(!x)return;
  const {error}=await sb.from('gastos_fatura_itens').delete().eq('id',x.id);if(error)return toast(erroPT(error));
  // lançamento criado pela fatura sai junto; um lançamento seu (já no Painel) fica
  let lanc=null;if(x.lancamento_id&&!x.ja_lancado){lanc=LANCS.find(l=>l.id===x.lancamento_id)||null;await sb.from('gastos_lancamentos').delete().eq('id',x.lancamento_id);}
  const f=FATURAS.find(i=>i.id===FAT_SEL);
  FAT_ITENS=FAT_ITENS.filter(i=>i!==x);await atualizarQtd();if(x.ja_lancado&&f)await ajustarTotalPainel(f);renderFatura();carregarMes();
  toast('Item excluído: '+x.descricao,'Desfazer',async()=>{if(lanc){const r=await sb.from('gastos_lancamentos').insert(lanc);if(r.error)return toast(erroPT(r.error));}
    const r=await sb.from('gastos_fatura_itens').insert(x);if(r.error)return toast(erroPT(r.error));FAT_ITENS.push(x);FAT_ITENS.sort((a,b)=>(a.data_compra||'').localeCompare(b.data_compra||''));await atualizarQtd();if(x.ja_lancado&&f)await ajustarTotalPainel(f);renderFatura();carregarMes();});});
// adicionar item à mão
$('fd-add').addEventListener('submit',async e=>{e.preventDefault();const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f)return;
  const desc=$('fd-a-desc').value.trim(),valor=parseValor($('fd-a-valor').value),data=$('fd-a-data').value||null;
  if(!desc)return msg('fd-msg','Escreva o nome da compra.','warn');if(!(valor>0))return msg('fd-msg','Digite o valor. Ex.: 45,90','warn');
  const cat=sugerirCat(desc,'despesa').cat;let lancId=null;
  if(f.modo==='itens'){const r=await sb.from('gastos_lancamentos').insert({tipo:'despesa',valor,descricao:desc,data:f.vencimento,data_compra:data,categoria_id:cat?.id||null,forma:'credito',pago:!!FAT_TOT[f.id]?.pago||f.vencimento<=hojeISO(),origem:'fatura',importacao_id:f.id}).select('id').single();
    if(r.error)return msg('fd-msg',erroPT(r.error));lancId=r.data.id;}
  const {data:it,error}=await sb.from('gastos_fatura_itens').insert({importacao_id:f.id,data_compra:data,descricao:desc.slice(0,120),valor,credito:false,categoria_id:cat?.id||null,lancamento_id:lancId}).select().single();
  if(error)return msg('fd-msg',erroPT(error));
  FAT_ITENS.push({...it,valor:Number(it.valor)});FAT_ITENS.sort((a,b)=>(a.data_compra||'').localeCompare(b.data_compra||''));
  if(f.modo==='itens'){f.total=Math.round((f.total+valor)*100)/100;await sb.from('gastos_importacoes').update({total:f.total}).eq('id',f.id);carregarMes();}
  await atualizarQtd();$('fd-a-desc').value='';$('fd-a-valor').value='';msg('fd-msg');renderFatura();$('fd-a-desc').focus();
  toast(`Item adicionado em ${cat?.nome||'Diversos'}.`);});
async function atualizarQtd(){const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f)return;f.qtd=FAT_ITENS.length;
  const upd={qtd:f.qtd};if(f.modo==='itens'){f.total=Math.round((FAT_ITENS.filter(x=>!x.credito).reduce((s,x)=>s+x.valor,0)-FAT_ITENS.filter(x=>x.credito).reduce((s,x)=>s+x.valor,0))*100)/100;upd.total=f.total;}
  await sb.from('gastos_importacoes').update(upd).eq('id',f.id);renderFaturas();}
// valor, vencimento e pago
$('fd-valor').addEventListener('change',async()=>{const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f||f.modo!=='total')return;const v=parseValor($('fd-valor').value);
  if(!(v>0)){$('fd-valor').value=valorTx(f.total);return toast('Valor inválido.');}
  await sb.from('gastos_importacoes').update({total:v}).eq('id',f.id);f.total=v;await ajustarTotalPainel(f);renderFatura();renderFaturas();carregarMes();toast('Valor da fatura atualizado no Painel.');});
$('fd-venc').addEventListener('change',async()=>{const f=FATURAS.find(x=>x.id===FAT_SEL),v=$('fd-venc').value;if(!f||!v)return;
  await sb.from('gastos_importacoes').update({vencimento:v}).eq('id',f.id);
  if(f.modo==='total'){const t=FAT_TOT[f.id];if(t)await sb.from('gastos_lancamentos').update({data:v}).eq('id',t.id);}
  else await sb.from('gastos_lancamentos').update({data:v}).eq('importacao_id',f.id).eq('origem','fatura');
  f.vencimento=v;FATURAS.sort((a,b)=>(b.vencimento||'').localeCompare(a.vencimento||''));renderFatura();renderFaturas();carregarMes();toast('Vencimento atualizado.');});
$('fd-pago').addEventListener('change',async()=>{const f=FATURAS.find(x=>x.id===FAT_SEL),t=f&&FAT_TOT[f.id];if(!t)return;const p=$('fd-pago').checked;
  const {error}=await sb.from('gastos_lancamentos').update({pago:p}).eq('id',t.id);if(error)return toast(erroPT(error));t.pago=p;renderFaturas();carregarMes();toast(p?'Fatura marcada como paga.':'Fatura marcada como a pagar.');});
$('fd-relancar').onclick=async()=>{const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f)return;const r=await lancarTotal(f,f.vencimento<=hojeISO(),Math.max(0.01,f.total-jaLanc()));if(r.error)return toast(erroPT(r.error));
  await carregarFaturas();renderFatura();carregarMes();toast('Valor da fatura lançado no Painel.');};
// excluir fatura inteira
$('fd-excluir').onclick=async()=>{const b=$('fd-excluir');if(b.dataset.conf!=='1'){b.dataset.conf='1';b.textContent='Excluir fatura e itens?';setTimeout(()=>{b.dataset.conf='';b.textContent='Excluir fatura';},3500);return;}
  b.dataset.conf='';b.textContent='Excluir fatura';const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f)return;
  const {error}=await sb.from('gastos_importacoes').delete().eq('id',f.id);if(error)return toast(erroPT(error));
  toast(`Fatura ${f.cartao} excluída (e o valor dela saiu do Painel).`);fecharFatura();await carregarFaturas();carregarMes();};
$('fd-csv').onclick=()=>{const f=FATURAS.find(x=>x.id===FAT_SEL);if(!f||!FAT_ITENS.length)return toast('Esta fatura não tem itens.');
  const linhas=[['Data','Descrição','Categoria','Parcela','Valor']].concat(FAT_ITENS.map(x=>[dBR(x.data_compra),x.descricao,catPorId(x.categoria_id)?.nome||'',x.parcela||'',valorTx(x.credito?-x.valor:x.valor)]));
  const csv='﻿'+linhas.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`fatura-${norm(f.cartao).toLowerCase().replace(/ /g,'-')||'cartao'}-${f.vencimento}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);};

// fatura sem arquivo
$('fm-venc').value=(()=>{const d=new Date();return iso(d.getFullYear(),d.getMonth(),10);})();
$('fm-form').addEventListener('submit',async e=>{e.preventDefault();msg('fm-msg');
  const cartao=$('fm-cartao').value.trim(),venc=$('fm-venc').value,v=parseValor($('fm-valor').value);
  if(!cartao)return msg('fm-msg','Diga qual é o cartão.','warn');if(!venc)return msg('fm-msg','Informe o vencimento.','warn');if(!(v>0))return msg('fm-msg','Digite o valor da fatura. Ex.: 1.234,56','warn');
  const imp=await sb.from('gastos_importacoes').insert({arquivo:'(sem arquivo)',cartao:cartao.slice(0,40),vencimento:venc,modo:'total',qtd:0,total:v}).select().single();
  if(imp.error)return msg('fm-msg',erroPT(imp.error));
  const r=await lancarTotal(imp.data,$('fm-pago').checked);if(r.error){await sb.from('gastos_importacoes').delete().eq('id',imp.data.id);return msg('fm-msg',erroPT(r.error));}
  $('fm-valor').value='';$('fm-pago').checked=false;const [y,m]=venc.split('-').map(Number);MES={y,m:m-1};
  toast(`Fatura ${cartao} salva: ${fmt(v)} no Painel.`);await carregarMes();await carregarFaturas();abrirFatura(imp.data.id);});


// ===================== lançou algo que já está numa fatura? =====================
async function compraNaFatura(valor,data){if(!data)return null;
  const {data:its}=await sb.from('gastos_fatura_itens').select('*').eq('valor',valor).eq('ja_lancado',false).eq('credito',false).gte('data_compra',addDias(data,-3)).lte('data_compra',addDias(data,3));
  const it=(its||[]).find(i=>!i.lancamento_id||true);if(!it)return null;
  if(!FATURAS.some(f=>f.id===it.importacao_id))await carregarFaturas();const f=FATURAS.find(x=>x.id===it.importacao_id);return f?{it,f}:null;}
async function juntarComFatura(lancId,{it,f}){
  if(f.modo==='total'){await sb.from('gastos_fatura_itens').update({ja_lancado:true,lancamento_id:lancId}).eq('id',it.id);
    const t=FAT_TOT[f.id];if(t){const v=Math.round((Number(t.valor)-Number(it.valor))*100)/100;if(v>0){await sb.from('gastos_lancamentos').update({valor:v}).eq('id',t.id);t.valor=v;}}}
  else{await sb.from('gastos_lancamentos').delete().eq('id',lancId);} // a fatura já tem essa compra como lançamento
  toast(`Juntei com a compra da fatura ${f.cartao}. Agora conta uma vez só.`);await carregarMes();if(FAT_SEL===f.id)abrirFatura(f.id);}
async function avisarSeNaFatura(lancId,valor,data,textoOk){const m=await compraNaFatura(valor,data);if(!m)return false;
  toast(`${textoOk} Essa compra já está na fatura ${m.f.cartao} (${m.it.descricao}, ${dBR(m.it.data_compra).slice(0,5)}).`,'Juntar',()=>juntarComFatura(lancId,m));return true;}

// apagou do Painel um lançamento que estava descontado de uma fatura: devolve o valor para a fatura (e o contrário no Desfazer)
async function religarFatura(lig,lancId,ligar){for(const it of lig||[]){
  await sb.from('gastos_fatura_itens').update(ligar?{ja_lancado:true,lancamento_id:lancId}:{ja_lancado:false}).eq('id',it.id);
  const {data:t}=await sb.from('gastos_lancamentos').select('id,valor').eq('origem','fatura_total').eq('importacao_id',it.importacao_id);
  if(t&&t[0]){const v=Math.round((Number(t[0].valor)+(ligar?-1:1)*Number(it.valor))*100)/100;if(v>0)await sb.from('gastos_lancamentos').update({valor:v}).eq('id',t[0].id);}}
  if((lig||[]).length)carregarFaturas();}
