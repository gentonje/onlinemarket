import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Respond with a not implemented message
  return new Response(
    JSON.stringify({ error: 'Checkout is not available in this region.' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 501,
    }
  );
});