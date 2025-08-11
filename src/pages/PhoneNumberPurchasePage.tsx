import { PhoneNumberPurchase } from "@/components/connect/PhoneNumberPurchase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PhoneNumberPurchasePage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageHeader
        title="Get a Phone Number"
        description="Search and purchase phone numbers for your business. All numbers are free during beta."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/settings/phone-numbers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Phone Numbers
          </Button>
        }
      />
      
      <PhoneNumberPurchase />
    </PageLayout>
  );
}