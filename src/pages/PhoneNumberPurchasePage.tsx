import { PhoneNumberPurchase } from "@/components/connect/PhoneNumberPurchase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PhoneNumberPurchasePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings/phone-numbers/manage')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Phone Numbers
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Get a Phone Number</h1>
        <p className="text-muted-foreground">
          Search and purchase phone numbers for your business. All numbers are free during beta.
        </p>
      </div>
      
      <PhoneNumberPurchase />
    </div>
  );
}