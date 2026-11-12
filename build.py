"""Monta o index.html: copia src/fatura.js, src/faturas.js e src/voz.js para dentro do script e carimba a versão."""
import time,re
p=open('index.html',encoding='utf-8').read()
ini=p.index('// ===================== separação automática por item')
fim=p.index('\n// recarrega quando volta para o app')
js='\n\n'.join(open(f,encoding='utf-8').read().rstrip('\n') for f in ['src/fatura.js','src/faturas.js','src/voz.js'])
js=js.replace('/*VERSAO*/',time.strftime('%Y%m%d-%H%M%S'))
p=p[:ini]+js+p[fim:]
open('index.html','w',encoding='utf-8').write(p)
print('ok',len(p))
