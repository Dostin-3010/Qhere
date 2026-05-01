// QHere - Supabase Edge Function opcional.
// Recibe eventos de asistencia y deja lista la integracion para notificaciones externas.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Metodo no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await req.json().catch(() => ({}));

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Evento de asistencia recibido por QHere.",
      received: payload,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
