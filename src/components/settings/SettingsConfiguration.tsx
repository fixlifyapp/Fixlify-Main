
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobTypesConfig } from "./configuration/JobTypesConfig";
import { JobStatusesConfig } from "./configuration/JobStatusesConfig";
import { LeadSourcesConfig } from "./configuration/LeadSourcesConfig";
import { TagsConfig } from "./configuration/TagsConfig";
import { CustomFieldsConfig } from "./configuration/CustomFieldsConfig";
import { MailgunConfig } from "./configuration/MailgunConfig";
import { TelnyxConfig } from "./configuration/TelnyxConfig";
import { DocumentNumberingConfig } from "./configuration/DocumentNumberingConfig";
import { NicheConfig } from "./configuration/NicheConfig";
import { useAuth } from "@/hooks/use-auth";


export function SettingsConfiguration() {
  const { user } = useAuth();
  
  console.log('SettingsConfiguration rendered with user:', user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">
          Manage your system configuration and integrations
        </p>
      </div>

      <Tabs defaultValue="business-niche" className="space-y-4">
        <TabsList className="grid grid-cols-9 w-full">
          <TabsTrigger value="business-niche">Business Niche</TabsTrigger>
          <TabsTrigger value="document-numbering">Document Numbering</TabsTrigger>
          <TabsTrigger value="job-types">Job Types</TabsTrigger>
          <TabsTrigger value="job-statuses">Job Statuses</TabsTrigger>
          <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="mailgun">Email</TabsTrigger>
          <TabsTrigger value="telnyx">SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="business-niche">
          <NicheConfig userId={user?.id || ""} />
        </TabsContent>

        <TabsContent value="document-numbering">
          <DocumentNumberingConfig />
        </TabsContent>

        <TabsContent value="job-types">
          <JobTypesConfig />
        </TabsContent>

        <TabsContent value="job-statuses">
          <JobStatusesConfig />
        </TabsContent>

        <TabsContent value="lead-sources">
          <LeadSourcesConfig />
        </TabsContent>

        <TabsContent value="tags">
          <TagsConfig />
        </TabsContent>

        <TabsContent value="custom-fields">
          <CustomFieldsConfig />
        </TabsContent>

        <TabsContent value="mailgun">
          <MailgunConfig />
        </TabsContent>

        <TabsContent value="telnyx">
          <TelnyxConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
