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

## Play Store

O app é um PWA (manifest + service worker), pronto para virar um app Android pelo **PWABuilder** (pwabuilder.com → colar o endereço → Android → gerar o pacote .aab).
