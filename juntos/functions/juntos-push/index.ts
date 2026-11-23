// Envia notificações (Web Push) do app Juntos para os celulares das pessoas.
// Só aceita chamadas do próprio banco, que mandam o segredo guardado em juntos_config.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const APP_URL = "https://isaacnery140-commits.github.io/controle-de-gastos/juntos/";
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

type Msg = { users: string[]; title: string; body: string; tela?: string };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const { data: cfg } = await sb.from("juntos_config")
    .select("vapid_public,vapid_private,push_secret").eq("id", 1).single();
  if (!cfg?.push_secret || req.headers.get("x-juntos-secret") !== cfg.push_secret) return json({ error: "forbidden" }, 403);
  webpush.setVapidDetails(APP_URL, cfg.vapid_public, cfg.vapid_private);

  const body = await req.json().catch(() => ({}));
  let msgs: Msg[] = [];
  if (body.kind === "send") {
    msgs = [{ users: body.users ?? [], title: String(body.title ?? "Juntos"), body: String(body.body ?? ""), tela: body.tela }];
  } else if (body.kind === "lembretes") {
    const { data, error } = await sb.rpc("juntos_lembretes");
    if (error) return json({ error: error.message }, 500);
    msgs = (data ?? []).map((m: Msg) => ({ ...m, tela: "agenda" }));
  } else return json({ error: "kind" }, 400);

  let sent = 0, failed = 0;
  for (const m of msgs) {
    if (!m.users?.length) continue;
    const { data: subs } = await sb.from("juntos_push_subs").select("endpoint,p256dh,auth").in("user_id", m.users);
    const url = APP_URL + (m.tela ? "#" + m.tela : "");
    await Promise.all((subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: m.title, body: m.body, url }),
          { TTL: 3600, urgency: "high" },
        );
        sent++;
      } catch (e) {
        failed++;
        const code = (e as { statusCode?: number }).statusCode ?? 0;
        if (code === 404 || code === 410) await sb.from("juntos_push_subs").delete().eq("endpoint", s.endpoint);
      }
    }));
  }
  return json({ sent, failed });
});
