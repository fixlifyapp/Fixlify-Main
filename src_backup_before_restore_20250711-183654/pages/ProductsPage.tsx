import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { JobProducts } from "@/components/jobs/JobProducts";
import { Package, BarChart3, Target, Zap, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const ProductsPage = () => {
  const { user } = useAuth();
  const [businessNiche, setBusinessNiche] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessNiche = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_niche')
          .eq('id', user.id)
          .single();
          
        if (profile?.business_niche) {
          setBusinessNiche(profile.business_niche);
        }
      } catch (error) {
        console.error('Error fetching business niche:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessNiche();
  }, [user]);

  const getNicheBadges = () => {
    const badges = [
      { text: "Inventory Tracking", icon: BarChart3, variant: "fixlyfy" as const },
      { text: "Smart Pricing", icon: Target, variant: "success" as const },
      { text: "Quick Import", icon: Zap, variant: "info" as const }
    ];

    // Add business niche badge if available
    if (businessNiche) {
      badges.unshift({ 
        text: businessNiche, 
        icon: Store, 
        variant: "default" as const 
      });
    }

    return badges;
  };

  return (
    <PageLayout>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        icon={Package}
        badges={getNicheBadges()}
      />

      <Card className="border-fixlyfy-border shadow-sm">
        <JobProducts jobId="" />
      </Card>
    </PageLayout>
  );
};

export default ProductsPage;
