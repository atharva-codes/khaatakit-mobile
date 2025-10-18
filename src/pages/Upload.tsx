import { useState } from "react";
import { Camera, FileText, Upload as UploadIcon } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [smsText, setSmsText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Receipt uploaded",
        description: "Image uploaded successfully",
      });
    }
  };

  const handleSubmit = () => {
    if (!smsText && !selectedImage) {
      toast({
        title: "No data",
        description: "Please add SMS text or upload a receipt",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction added",
      description: "Your transaction has been recorded successfully",
    });
    
    setSmsText("");
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Upload Transactions</h1>
        <p className="text-sm opacity-90">Add SMS or receipt images</p>
      </div>

      <div className="p-4 space-y-4">
        {/* SMS Upload Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Paste SMS Transaction</h2>
          </div>
          <Textarea
            placeholder="Paste your bank SMS here... (e.g., 'Debited Rs 500 from A/C XX1234 on 01-Jan-2025')"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="min-h-32"
          />
        </Card>

        {/* Receipt Upload Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Upload Receipt Image</h2>
          </div>
          
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
              id="camera-input"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="gallery-input"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("camera-input")?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("gallery-input")?.click()}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose from Gallery
              </Button>
            </div>

            {selectedImage && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border">
                <img
                  src={selectedImage}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <Button className="w-full" size="lg" onClick={handleSubmit}>
          <UploadIcon className="h-5 w-5 mr-2" />
          Submit Transaction
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Upload;
