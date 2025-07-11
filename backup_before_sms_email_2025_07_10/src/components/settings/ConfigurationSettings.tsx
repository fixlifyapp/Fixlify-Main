
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, Tag, Briefcase, FileText, Database, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

export const ConfigurationSettings = () => {
  const configSections = [
    {
      title: "Business Niche",
      description: "Set your business type and specialization",
      icon: Briefcase,
      href: "/configuration#business-niche"
    },
    {
      title: "Tax Settings",
      description: "Configure default tax rates and labels",
      icon: Receipt,
      href: "/configuration#tax-settings"
    },
    {
      title: "Tags",
      description: "Manage client and job tags",
      icon: Tag,
      href: "/configuration#tags"
    },
    {
      title: "Job Types",
      description: "Configure job categories and types",
      icon: FileText,
      href: "/configuration#job-types"
    },
    {
      title: "Job Statuses",
      description: "Manage workflow statuses",
      icon: Database,
      href: "/configuration#job-statuses"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Business Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure your business settings, tax rates, job types, statuses, and custom fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configSections.map((section) => (
          <Link key={section.title} to={section.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6 space-x-4">
                <div className="bg-fixlyfy/10 p-3 rounded-full">
                  <section.icon className="h-6 w-6 text-fixlyfy" />
                </div>
                <div>
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link to="/settings/configuration" className="text-fixlyfy hover:underline text-sm">
              Go to Full Configuration →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
