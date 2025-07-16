
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessInfoCardProps {
  companyName: string;
  agentName: string;
  onCompanyNameChange: (value: string) => void;
  onAgentNameChange: (value: string) => void;
}

export const BusinessInfoCard = ({ 
  companyName, 
  agentName, 
  onCompanyNameChange, 
  onAgentNameChange 
}: BusinessInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="agent_name">AI Agent Name</Label>
            <Input
              id="agent_name"
              value={agentName}
              onChange={(e) => onAgentNameChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
