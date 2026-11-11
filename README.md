# Controle de Gastos

App de controle de gastos pessoais, no mesmo estilo do **Programador Raynen**: um único `index.html`, sem build, que abre no navegador e funciona no celular (dá para "Adicionar à tela inicial").

## O que faz

- Login com e-mail e senha (Supabase Auth). Cada pessoa só vê os próprios lançamentos.
- Lançar **despesas** e **receitas** com valor, descrição, data, categoria, forma de pagamento e "pago / a pagar".
- **Parcelas**: repete o lançamento por até 24 meses (ex.: compra no cartão em 10x).
- **Resumo do mês**: receitas, despesas, saldo, contas a pagar, comparação com o mês anterior.
- **Despesas por categoria** com orçamento mensal (marca na barra e aviso quando passa).
- **Gráfico dos últimos 6 meses** (receitas, despesas e linha de saldo).
- Busca e filtros, exportação em **CSV** (abre no Excel), tema claro/escuro.
- Categorias padrão criadas no primeiro acesso; dá para renomear, mudar a cor, definir orçamento, criar e excluir.

## Estrutura

- `index.html`: o app inteiro (HTML + CSS + JS).
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`: ícone e instalação no celular.
- `supabase/gastos_inicial.sql`: tabelas e regras de segurança.

## Banco de dados

Projeto Supabase `pvhoumlovxjlqvmchobv` (o mesmo da Agenda). As tabelas do app usam o prefixo `gastos_` e não mexem nas tabelas `agenda_*`.

- `gastos_categorias`: nome, tipo (despesa/receita), cor, ícone, orçamento.
- `gastos_lancamentos`: tipo, valor, descrição, data, categoria, forma, pago.

As duas têm RLS ativo: cada usuário só lê e grava linhas com o próprio `user_id`. A chave que fica no `index.html` é a chave **pública** (publishable), feita para ficar no navegador.

## Publicar

Settings → Pages → Branch `main` / pasta `/ (root)`. O endereço fica `https://isaacnery140-commits.github.io/controle-de-gastos/`.

No Supabase, em Authentication → URL Configuration, coloque esse endereço em **Site URL** (e em Redirect URLs) para o link de confirmação de e-mail voltar para o app.
