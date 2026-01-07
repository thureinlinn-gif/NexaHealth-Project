import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock wound classifications based on image analysis
const woundTypes = [
  "Laceration",
  "Abrasion",
  "Burn",
  "Bruise",
  "Cut",
  "Stab Wound",
  "Ingrown Nail"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock classification (in production, this would call an actual ML model)
    // For demo purposes, we'll simulate classification based on image characteristics
    const randomIndex = Math.floor(Math.random() * woundTypes.length);
    const label = woundTypes[randomIndex];
    const confidence = 0.75 + Math.random() * 0.2; // Random confidence between 0.75 and 0.95

    console.log(`Classification result: ${label} with confidence ${confidence}`);

    return new Response(
      JSON.stringify({
        label,
        confidence: parseFloat(confidence.toFixed(2))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in classify-wound function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
