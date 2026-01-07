import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Phone, ExternalLink, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { API_CONFIG } from "@/config/api";
import Header from "@/components/Header";

interface Facility {
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  distance?: number;
}

const FacilityMap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedType, setSelectedType] = useState<string>("UrgentCare");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Check if coming from assessment flow
    const severityType = sessionStorage.getItem('severityType');
    if (severityType) {
      setSelectedType(severityType);
      handleSearch(severityType);
    }
  }, []);

  const handleSearch = async (facilityType?: string) => {
    const searchType = facilityType || selectedType;
    setLoading(true);
    setHasSearched(true);

    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);

          try {
            const { data, error } = await supabase.functions.invoke('find-facilities', {
              body: {
                type: searchType,
                lat: location.lat,
                lng: location.lng
              }
            });

            if (error) throw error;
            setFacilities(data.facilities || []);
          } catch (error) {
            console.error('Error loading facilities:', error);
            toast({
              title: "Error loading facilities",
              description: "Unable to find nearby facilities",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location access denied",
            description: "Please enable location services to find nearby facilities",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (facility: Facility) => {
    return `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`;
  };

  const getDirectionsUrl = (facility: Facility) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.lat},${facility.lng}`;
    }
    return getGoogleMapsUrl(facility);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Finding nearby facilities...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Healthcare Facilities
          </h1>
          <p className="text-muted-foreground">
            Select facility type and search for nearby locations
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Facility Type Selection */}
          <Card className="p-6 shadow-[var(--shadow-elevated)]">
            <Label className="text-lg font-semibold mb-4 block">
              What type of care do you need?
            </Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="SelfCare" id="selfcare" />
                <Label htmlFor="selfcare" className="flex-1 cursor-pointer">
                  <div className="font-medium">Pharmacy / Self Care</div>
                  <div className="text-sm text-muted-foreground">Minor issues, over-the-counter solutions</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="UrgentCare" id="urgentcare" />
                <Label htmlFor="urgentcare" className="flex-1 cursor-pointer">
                  <div className="font-medium">Urgent Care</div>
                  <div className="text-sm text-muted-foreground">Non-life-threatening injuries, sprains, cuts</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="ER" id="er" />
                <Label htmlFor="er" className="flex-1 cursor-pointer">
                  <div className="font-medium">Emergency Room</div>
                  <div className="text-sm text-muted-foreground">Serious injuries, heavy bleeding, severe pain</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="TraumaCenter" id="trauma" />
                <Label htmlFor="trauma" className="flex-1 cursor-pointer">
                  <div className="font-medium">Trauma Center</div>
                  <div className="text-sm text-muted-foreground">Life-threatening emergencies, major trauma</div>
                </Label>
              </div>
            </RadioGroup>
            <Button
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary-glow"
              onClick={() => handleSearch()}
              size="lg"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Find Facilities
            </Button>
          </Card>
          {/* Results section - only show after search */}
          {hasSearched && (
            <>
              {/* Map Embed */}
              {userLocation && facilities.length > 0 && (
                <Card className="p-4 shadow-[var(--shadow-elevated)] overflow-hidden">
                  <iframe
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}&q=${facilities[0].lat},${facilities[0].lng}&zoom=14`}
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </Card>
              )}

              {/* Facilities List */}
              {facilities.length > 0 ? (
                <div className="space-y-4">
                  {facilities.map((facility, index) => (
                    <Card key={index} className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="text-xl font-bold">{facility.name}</h3>
                              <Badge variant="secondary" className="mt-1">
                                {facility.type.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                            </div>
                          </div>
                          {facility.address && (
                            <p className="text-sm text-muted-foreground ml-8">{facility.address}</p>
                          )}
                          {facility.phone && (
                            <div className="flex items-center gap-2 mt-2 ml-8">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a href={`tel:${facility.phone}`} className="text-sm text-primary hover:underline">
                                {facility.phone}
                              </a>
                            </div>
                          )}
                          {facility.distance && (
                            <p className="text-sm font-medium text-primary ml-8 mt-2">
                              {facility.distance.toFixed(1)} miles away
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getGoogleMapsUrl(facility), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Map
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-primary-glow"
                            onClick={() => window.open(getDirectionsUrl(facility), '_blank')}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No facilities found</h3>
                  <p className="text-muted-foreground">
                    Unable to find facilities nearby. Please try again or contact emergency services.
                  </p>
                </Card>
              )}
            </>
          )}

          {/* Emergency Notice */}
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-center">
              <strong className="text-destructive">Emergency:</strong> If this is a life-threatening situation, call 911 immediately instead of traveling to a facility.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacilityMap;
