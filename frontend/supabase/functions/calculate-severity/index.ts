import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeverityInput {
  woundLabel: string;
  pain: number;
  bleeding: string;
  swelling: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { woundLabel, pain, bleeding, swelling }: SeverityInput = await req.json();

    console.log(`Calculating severity for: ${woundLabel}, pain: ${pain}, bleeding: ${bleeding}, swelling: ${swelling}`);

    let severity = "UrgentCare";
    let recommendation = "";

    // Rule-based severity calculation
    if (woundLabel.toLowerCase().includes("stab")) {
      severity = "TraumaCenter";
      recommendation = "Stab wounds require immediate emergency care. Go to the nearest trauma center or call 911.";
    } else if (woundLabel.toLowerCase().includes("laceration") && bleeding === "heavy") {
      severity = "ER";
      recommendation = "Deep lacerations with heavy bleeding need emergency room care. Apply pressure and seek immediate medical attention.";
    } else if (woundLabel.toLowerCase().includes("burn") && pain >= 7) {
      severity = "ER";
      recommendation = "Severe burns require emergency room treatment. Keep the burn cool and clean while traveling to the ER.";
    } else if (woundLabel.toLowerCase().includes("bruise") && swelling) {
      severity = "UrgentCare";
      recommendation = "Bruises with significant swelling should be evaluated at an urgent care facility to rule out internal damage.";
    } else if ((woundLabel.toLowerCase().includes("abrasion") || woundLabel.toLowerCase().includes("cut")) && pain <= 3) {
      severity = "SelfCare";
      recommendation = "Minor abrasions and cuts can typically be treated at home. Clean the wound, apply antibiotic ointment, and bandage. Watch for signs of infection.";
    } else if (pain >= 8) {
      severity = "ER";
      recommendation = "High pain levels indicate a serious injury. Visit the emergency room for proper evaluation and pain management.";
    } else if (bleeding === "heavy") {
      severity = "ER";
      recommendation = "Heavy bleeding requires emergency care. Apply firm pressure and head to the nearest emergency room.";
    } else if (pain >= 5 || bleeding === "mild") {
      severity = "UrgentCare";
      recommendation = "Your symptoms suggest you should visit an urgent care facility for proper wound care and evaluation.";
    } else {
      severity = "SelfCare";
      recommendation = "Based on your symptoms, you may be able to treat this wound at home with proper first aid. Monitor for signs of infection such as increased redness, warmth, or pus.";
    }

    console.log(`Severity determined: ${severity}`);

    return new Response(
      JSON.stringify({ severity, recommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-severity function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
