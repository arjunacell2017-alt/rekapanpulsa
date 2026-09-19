import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: existing } = await admin.from("user_roles").select("id").eq("role", "admin").limit(1);
  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ ok: true, message: "Admin sudah ada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email, password, nama } = await req.json();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama: nama ?? "Administrator" },
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await admin.from("profiles").insert({ id: created.user!.id, nama: nama ?? "Administrator", email });
  await admin.from("user_roles").insert({ user_id: created.user!.id, role: "admin" });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
