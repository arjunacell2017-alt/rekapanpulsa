import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Tidak terautentikasi" }, 401);

    const admin = createClient(url, serviceKey);
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: userData } = await caller.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Sesi tidak valid" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Akses ditolak" }, 403);

    const { action, payload } = await req.json();

    switch (action) {
      case "list": {
        const { data: clients, error } = await admin
          .from("clients")
          .select("*")
          .order("kode");
        if (error) throw error;
        const { data: profiles } = await admin.from("profiles").select("id, nama, email, client_id");
        return json({
          clients: (clients ?? []).map((c) => ({
            ...c,
            users: (profiles ?? []).filter((p) => p.client_id === c.id),
          })),
        });
      }

      case "create": {
        const { nama, email, password, status } = payload as {
          nama: string;
          email: string;
          password: string;
          status: string;
        };
        if (!nama || !email || !password) return json({ error: "Data belum lengkap" }, 400);

        const { data: last } = await admin
          .from("clients")
          .select("kode")
          .order("kode", { ascending: false })
          .limit(1);
        const nomor = last?.[0]?.kode ? Number(String(last[0].kode).split("_")[1]) + 1 : 1;
        const kode = `CLIENT_${String(nomor).padStart(3, "0")}`;

        const { data: client, error: cErr } = await admin
          .from("clients")
          .insert({ kode, nama, email, status: status ?? "active" })
          .select()
          .single();
        if (cErr) throw cErr;

        const { data: created, error: uErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nama },
        });
        if (uErr) {
          await admin.from("clients").delete().eq("id", client.id);
          return json({ error: uErr.message }, 400);
        }

        await admin.from("profiles").insert({
          id: created.user!.id,
          nama,
          email,
          client_id: client.id,
        });
        await admin.from("user_roles").insert({ user_id: created.user!.id, role: "client" });

        return json({ client });
      }

      case "create_user": {
        const { client_id, nama, email, password } = payload as Record<string, string>;
        const { data: created, error: uErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nama },
        });
        if (uErr) return json({ error: uErr.message }, 400);
        await admin.from("profiles").insert({ id: created.user!.id, nama, email, client_id });
        await admin.from("user_roles").insert({ user_id: created.user!.id, role: "client" });
        return json({ ok: true });
      }

      case "update": {
        const { id, nama, email, status } = payload as Record<string, string>;
        const { error } = await admin.from("clients").update({ nama, email, status }).eq("id", id);
        if (error) throw error;
        await admin.from("profiles").update({ nama }).eq("client_id", id);
        return json({ ok: true });
      }

      case "toggle_status": {
        const { id, status } = payload as { id: string; status: string };
        const { error } = await admin.from("clients").update({ status }).eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }

      case "reset_password": {
        const { user_id, password } = payload as { user_id: string; password: string };
        const { error } = await admin.auth.admin.updateUserById(user_id, { password });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      case "delete": {
        const { id } = payload as { id: string };
        const { data: profiles } = await admin.from("profiles").select("id").eq("client_id", id);
        for (const p of profiles ?? []) {
          await admin.auth.admin.deleteUser(p.id);
        }
        const { error } = await admin.from("clients").delete().eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: "Aksi tidak dikenal" }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Terjadi kesalahan" }, 500);
  }
});
