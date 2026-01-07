import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Facility {
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
}

// Mock facility database (in production, this would come from a real database)
const mockFacilities: Facility[] = [
  {
    name: "Penn Presbyterian Medical Center",
    type: "ER",
    lat: 39.9555,
    lng: -75.1990,
    address: "51 N 39th St, Philadelphia, PA 19104",
    phone: "(215) 662-8000"
  },
  {
    name: "Jefferson University Hospital",
    type: "TraumaCenter",
    lat: 39.9483,
    lng: -75.1580,
    address: "111 S 11th St, Philadelphia, PA 19107",
    phone: "(215) 955-6000"
  },
  {
    name: "Jefferson Urgent Care Center City",
    type: "UrgentCare",
    lat: 39.9520,
    lng: -75.1620,
    address: "833 Chestnut St E, Philadelphia, PA 19107",
    phone: "(215) 503-8000"
  },
  {
    name: "Temple University Hospital",
    type: "ER",
    lat: 39.9680,
    lng: -75.1550,
    address: "3401 N Broad St, Philadelphia, PA 19140",
    phone: "(215) 707-2000"
  },
  {
    name: "Patient First Urgent Care",
    type: "UrgentCare",
    lat: 39.9602,
    lng: -75.1872,
    address: "3900 Chestnut St, Philadelphia, PA 19104",
    phone: "(215) 387-3900"
  },
  {
    name: "CVS MinuteClinic",
    type: "SelfCare",
    lat: 39.9540,
    lng: -75.1695,
    address: "1826 Chestnut St, Philadelphia, PA 19103",
    phone: "(215) 564-3901"
  },
  {
    name: "Hospital of the University of Pennsylvania",
    type: "TraumaCenter",
    lat: 39.9495,
    lng: -75.1955,
    address: "3400 Spruce St, Philadelphia, PA 19104",
    phone: "(215) 662-4000"
  },
  {
    name: "Rothman Orthopaedic Institute Urgent Care",
    type: "UrgentCare",
    lat: 39.9485,
    lng: -75.1625,
    address: "123 S 9th St, Philadelphia, PA 19107",
    phone: "(267) 339-3500"
  }
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, lat, lng } = await req.json();

    console.log(`Finding facilities for type: ${type}, location: ${lat}, ${lng}`);

    // Filter facilities by type
    let filteredFacilities = mockFacilities;
    
    if (type === "SelfCare") {
      filteredFacilities = mockFacilities.filter(f => 
        f.type === "SelfCare" || f.type === "UrgentCare"
      );
    } else if (type === "UrgentCare") {
      filteredFacilities = mockFacilities.filter(f => 
        f.type === "UrgentCare" || f.type === "ER"
      );
    } else if (type === "ER") {
      filteredFacilities = mockFacilities.filter(f => 
        f.type === "ER" || f.type === "TraumaCenter"
      );
    } else if (type === "TraumaCenter") {
      filteredFacilities = mockFacilities.filter(f => 
        f.type === "TraumaCenter" || f.type === "ER"
      );
    }

    // Calculate distances and sort
    const facilitiesWithDistance = filteredFacilities.map(facility => ({
      ...facility,
      distance: calculateDistance(lat, lng, facility.lat, facility.lng)
    }));

    facilitiesWithDistance.sort((a, b) => a.distance - b.distance);

    // Return top 3 closest facilities
    const nearestFacilities = facilitiesWithDistance.slice(0, 3);

    console.log(`Found ${nearestFacilities.length} nearby facilities`);

    return new Response(
      JSON.stringify({ facilities: nearestFacilities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in find-facilities function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
