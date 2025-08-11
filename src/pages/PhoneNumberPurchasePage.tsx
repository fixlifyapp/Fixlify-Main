import { PhoneNumberPurchase } from "@/components/connect/PhoneNumberPurchase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PhoneNumberPurchasePage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Get a Phone Number"
          subtitle="Search and purchase phone numbers for your business. All numbers are free during beta."
          icon={ShoppingCart}
          badges={[
            { text: "Free Beta", icon: TrendingUp, variant: "success" },
            { text: "Instant Setup", icon: Zap, variant: "info" },
            { text: "SMS & Voice", icon: Phone, variant: "fixlyfy" }
          ]}
          actionButton={{
            text: "Back to Phone Numbers",
            icon: ArrowLeft,
            onClick: () => navigate('/settings/phone-numbers')
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="slide-up" delay={200}>
        <PhoneNumberPurchase />
      </AnimatedContainer>
    </PageLayout>
  );
}