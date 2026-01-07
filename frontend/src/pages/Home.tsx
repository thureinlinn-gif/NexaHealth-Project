import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Sparkles, Shield, Send, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { CometCard } from "@/components/ui/comet-card";
import heroBackground from "@/assets/healthcare-hero-bg.jpg";
import avaxLogo from "@/assets/Avalanche_logo.png";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Typewriter effect state
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const healthQuestions = [
    "What are the symptoms of a common cold?",
    "How can I manage stress and anxiety?",
    "What should I do for a headache?",
    "How much water should I drink daily?",
    "What are healthy eating habits?",
    "How can I improve my sleep quality?",
  ];

  const medicalKeywords = [
    "skin irritation",
    "wounds on skin",
    "wound",
    "injury",
    "cut",
    "burn",
    "bruise",
    "laceration",
    "abrasion",
    "rash",
    "infection",
    "bleeding"
  ];

  // Typewriter effect
  useEffect(() => {
    const currentQuestion = healthQuestions[currentQuestionIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && placeholderText === currentQuestion) {
        // Pause at end before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && placeholderText === "") {
        // Move to next question
        setIsDeleting(false);
        setCurrentQuestionIndex((prev) => (prev + 1) % healthQuestions.length);
      } else if (isDeleting) {
        // Delete character
        setPlaceholderText(currentQuestion.substring(0, placeholderText.length - 1));
      } else {
        // Add character
        setPlaceholderText(currentQuestion.substring(0, placeholderText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, currentQuestionIndex, healthQuestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    const lowerPrompt = prompt.toLowerCase();
    const hasMedicalKeyword = medicalKeywords.some(keyword => 
      lowerPrompt.includes(keyword)
    );

    if (hasMedicalKeyword) {
      setShowImagePrompt(true);
      toast({
        title: "Medical Image Recommended",
        description: "For wound or skin-related queries, we recommend uploading an image for accurate assessment.",
      });
    } else {
      // Navigate to chat page with the question
      // Store the initial message in sessionStorage for the chat page
      const initialMessage = prompt.trim();
      sessionStorage.setItem('initialChatMessage', initialMessage);
      navigate("/chat");
    }
  };

  const handleScanImage = () => {
    navigate("/upload");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem("woundImage", reader.result as string);
      navigate("/symptoms");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/50 to-background/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              NexaHealth
            </h1>
          </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                AI-powered language learning and medical assessment. Ask anything or scan wounds for instant analysis.
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#E84142]/20 border border-[#E84142]/30 shadow-sm mb-8 hover:bg-[#E84142]/25 transition-colors">
                <img src={avaxLogo} alt="Avalanche Logo" className="h-6 w-6 object-contain" />
                <span className="text-sm font-medium text-foreground">
                  Chat history powered by <span className="font-bold text-[#E84142]">Avalanche (AVAX)</span> protocol
                </span>
              </div>
            </div>

            {/* Main Language Prompt Card */}
        <Card className="max-w-3xl mx-auto p-12 md:p-16 shadow-[var(--shadow-elevated)] border-2 border-primary/20 bg-card backdrop-blur-sm mb-16">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] animate-pulse">
                <Sparkles className="h-10 w-10 text-primary-foreground drop-shadow-lg" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ask Me Anything</h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Get instant help with language learning, translations, or medical assessments
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3 md:items-end">
                <Textarea
                  placeholder={placeholderText}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-background text-base border-border min-h-[80px] max-h-[120px] md:min-h-[48px] md:max-h-[48px] resize-none"
                  rows={1}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-3 justify-end md:justify-start">
                  <Button 
                    type="button"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-secondary to-secondary/80 h-12 w-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    title="Upload image for classification"
                  >
                    <Upload className="h-5 w-5 drop-shadow-md" />
                  </Button>
                  <Button 
                    type="submit"
                    size="icon"
                    className="bg-gradient-to-r from-primary to-primary-glow h-12 w-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                    disabled={!prompt.trim()}
                  >
                    <Send className="h-5 w-5 drop-shadow-md" />
                  </Button>
                </div>
              </div>
            </form>

            {showImagePrompt && (
              <Card className="p-6 bg-primary/10 border-primary/20">
                <p className="text-sm text-foreground mb-4 text-center">
                  📸 For accurate medical assessment, please scan an image of the affected area
                </p>
                <Button
                  onClick={handleScanImage}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow h-11"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Scan Image Now
                </Button>
              </Card>
            )}
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          <CometCard className="flex">
            <Card className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow border-0 w-full">
              <div className="flex flex-col items-center text-center space-y-3 min-h-[200px]">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Image Classification</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI analyzes wound images when you mention skin irritation or wounds
                </p>
              </div>
            </Card>
          </CometCard>

          <CometCard className="flex">
            <Card className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow border-0 w-full">
              <div className="flex flex-col items-center text-center space-y-3 min-h-[200px]">
                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Smart Triage</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations for urgent care, ER, or home treatment
                </p>
              </div>
            </Card>
          </CometCard>

          <CometCard className="flex">
            <Card className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow border-0 w-full">
              <div className="flex flex-col items-center text-center space-y-3 min-h-[200px]">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Find Care</h3>
                <p className="text-sm text-muted-foreground">
                  Locate nearest appropriate facility based on your needs
                </p>
              </div>
            </Card>
          </CometCard>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="p-4 bg-muted/50 border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-foreground">Medical Disclaimer:</strong> This tool provides guidance only and is not a substitute for professional medical advice. 
              In case of serious injury or emergency, call 911 immediately.
            </p>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
