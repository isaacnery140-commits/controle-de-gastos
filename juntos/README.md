# Juntos: agenda e gastos (app de teste)

App para celular com **agenda** e **controle de gastos** na mesma conta. Cada pessoa escolhe, para cada e-mail, o que compartilhar:

- só a agenda
- só os gastos
- os dois

Endereço: https://isaacnery140-commits.github.io/controle-de-gastos/juntos/

## Como funciona

- Login com e-mail e senha (Supabase Auth, projeto `pvhoumlovxjlqvmchobv`).
- Tabelas novas `juntos_perfis`, `juntos_compart`, `juntos_eventos` e `juntos_lancamentos` (veja `supabase.sql`). Os apps Agenda e Controle de Gastos não foram alterados.
- O banco decide o acesso: quem recebeu só a agenda não consegue ler os gastos, nem pelo app nem pela API (regra `juntos_pode`).
- Quem recebe o compartilhamento pode ver e também lançar e editar na área liberada.
- Dá para compartilhar com quem ainda não tem conta: quando a pessoa criar a conta com aquele e-mail, o acesso aparece.

## Lançar falando

Na aba Gastos, o botão 🎤 (canto esquerdo) ouve a frase e mostra o que entendeu (valor, descrição, categoria, data) antes de lançar; dá para corrigir o texto ou tocar em Ajustar. Uma frase pode ter mais de um gasto ("pizza 60 e gasolina 100"). Entende valor por extenso ou em número ("cento e vinte e cinco reais", "18 e 90"), entrada ou saída ("recebi", "ganhei"), data ("ontem", "anteontem", "dia 10"), parcelas ("em 3 vezes") e escolhe a categoria pelas palavras ("uber" → Transporte, "farmácia" → Saúde). Sem valor, abre o formulário preenchido. Onde o navegador não libera o reconhecimento de voz, dá para usar o 🎤 do teclado no mesmo campo.

## Fatura do cartão e relatório

- **💳 Fatura** (aba Gastos): anexa o PDF da fatura (pede a senha se tiver), a planilha, o CSV/OFX do banco ou o texto colado. A leitura é a mesma do Controle de Gastos (`fatura.js`). Na conferência dá para escolher a categoria de cada compra (vale para a mesma loja), desmarcar itens e importar **cada compra** ou **só o total**. O pagamento da fatura anterior vem desmarcado e compras já importadas aparecem como "já importada". Os lançamentos entram no mês do vencimento; a lista guarda a data da compra. Remover a fatura apaga os lançamentos dela.
- **📊 Relatório**: entradas, saídas e saldo do mês, comparação com o mês anterior, gastos por categoria com a média dos 3 meses anteriores, maiores gastos, faturas do mês e quem lançou. Compartilha como texto (WhatsApp etc.) ou salva em PDF.

## Avisos e notificações

- Cada compromisso tem o campo **Avisar** (na hora, 10 min, 30 min, 1 h, 2 h, 1 ou 2 dias antes). Sem hora marcada, o aviso conta a partir das 8h do dia.
- Com as notificações ativadas (botão 🔔 no topo ou no menu ☰), o celular recebe:
  - o lembrete do compromisso, para todos que enxergam aquela agenda;
  - um aviso de tudo que for criado, alterado, concluído ou excluído na agenda ou nos gastos, para as outras pessoas que têm acesso àquela parte (quem fez a mudança não recebe).
- Peças: tabelas `juntos_config` e `juntos_push_subs`, gatilhos `juntos_notificar` nas tabelas, tarefa `juntos-lembretes` (pg_cron, a cada minuto) e a Edge Function `juntos-push` (`functions/juntos-push`). SQL em `supabase_002_avisos.sql`.

## Play Store

O app é um PWA (manifest + service worker), pronto para virar um app Android pelo **PWABuilder** (pwabuilder.com → colar o endereço → Android → gerar o pacote .aab).
