
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Link } from "react-router-dom";
import { Settings2, Shield, Sliders, User, Phone, Brain, Building2, Plug, Package, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const SettingsPage = () => {
  const { user } = useAuth();
  
  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences"
        icon={Settings2}
        badges={[
          { text: "Security", icon: Shield, variant: "fixlyfy" },
          { text: "Customization", icon: Sliders, variant: "success" },
          { text: "Profile Management", icon: User, variant: "info" }
        ]}
      />
      
      {/* Main Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile & Company Card */}
        <Link to="/settings/profile">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <User className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Profile & Company</h3>
                <p className="text-sm text-muted-foreground">Manage personal information and company details</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Products Card */}
        <Link to="/settings/products">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Package className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Products</h3>
                <p className="text-sm text-muted-foreground">Manage your product catalog and inventory</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Integrations Card */}
        <Link to="/settings/integrations">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Plug className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Integrations</h3>
                <p className="text-sm text-muted-foreground">Connect with third-party services and tools</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Configuration Card */}
        <Link to="/settings/configuration">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Settings2 className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage business niche, tags, job types, statuses, and custom fields</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Phone Numbers Card */}
        <Link to="/settings/phone-numbers">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Phone Numbers</h3>
                <p className="text-sm text-muted-foreground">Buy, manage, and configure your phone numbers</p>
              </div>
            </div>
          </div>
        </Link>
        

      </div>
    </PageLayout>
  );
};

export default SettingsPage;
