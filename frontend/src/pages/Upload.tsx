import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Store image in sessionStorage for next page
    sessionStorage.setItem('woundImage', selectedImage);
    navigate("/symptoms");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload Wound Image
          </h1>
          <p className="text-muted-foreground">
            Take a clear photo of the wound for AI analysis
          </p>
        </div>

        {/* Upload Card */}
        <Card className="max-w-3xl mx-auto p-8 shadow-[var(--shadow-elevated)]">
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 md:p-12 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                {selectedImage ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={selectedImage}
                      alt="Selected wound"
                      className="max-h-96 mx-auto rounded-lg shadow-lg object-contain"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Guidelines */}
            <Card className="p-4 bg-muted/50 border-border/50">
              <h3 className="font-semibold mb-2 flex items-center">
                <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                Image Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Ensure good lighting</li>
                <li>• Keep the wound in focus</li>
                <li>• Include the entire affected area</li>
                <li>• Avoid shadows or reflections</li>
              </ul>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                onClick={handleContinue}
                disabled={!selectedImage}
              >
                Continue to Symptoms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
