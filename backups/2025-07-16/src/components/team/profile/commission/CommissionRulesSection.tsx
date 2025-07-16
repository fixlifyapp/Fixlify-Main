
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CommissionRule } from "@/types/team-member";
import { toast } from "sonner";
import { CalendarDays, DollarSign } from "lucide-react";

interface CommissionRulesSectionProps {
  commissionRules: CommissionRule[];
  isEditing: boolean;
  canManageCommissions: boolean;
  onDeleteRule: (id: string) => void;
  onAddRule: (rule: CommissionRule) => void;
}

export const CommissionRulesSection = ({
  commissionRules,
  isEditing,
  canManageCommissions,
  onDeleteRule,
  onAddRule
}: CommissionRulesSectionProps) => {
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<"schedule" | "job-type" | "amount" | "company">("job-type");
  const [newRuleValue, setNewRuleValue] = useState(50);
  
  const handleAddRule = () => {
    if (!isEditing || !newRuleName || !canManageCommissions) return;
    
    const newRule: CommissionRule = {
      id: Date.now().toString(),
      name: newRuleName,
      type: newRuleType,
      value: newRuleValue,
      condition: {}
    };
    
    onAddRule(newRule);
    setNewRuleName("");
    setNewRuleValue(50);
  };
  
  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case "schedule": return <CalendarDays className="h-4 w-4 text-indigo-500" />;
      case "job-type": return <span className="text-blue-500 text-sm font-mono">J</span>;
      case "amount": return <DollarSign className="h-4 w-4 text-green-500" />;
      case "company": return <span className="text-purple-500 text-sm font-mono">C</span>;
      default: return null;
    }
  };
  
  return (
    <Card className="p-6 border-fixlyfy-border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Commission Rules</h3>
      
      <div className="space-y-4">
        {commissionRules.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-md text-muted-foreground">
            No commission rules defined yet.
          </div>
        ) : (
          commissionRules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                {getRuleTypeIcon(rule.type)}
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.type === "schedule" ? "Schedule Override" : 
                     rule.type === "job-type" ? "Job Type Rule" :
                     rule.type === "amount" ? "Amount-Based" :
                     "Company Rate"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-medium">{rule.value}%</span>
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => onDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        {isEditing && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Rule name"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="flex-1"
              />
              
              <select 
                className="border rounded-md px-3 py-2 bg-white"
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as any)}
              >
                <option value="job-type">Job Type</option>
                <option value="schedule">Schedule</option>
                <option value="amount">Amount</option>
                <option value="company">Company</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="new-rule-value">Commission Rate (%)</Label>
              <Input
                id="new-rule-value"
                type="number"
                value={newRuleValue}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setNewRuleValue(value);
                  }
                }}
                className="w-20 text-right"
                min="0"
                max="100"
              />
            </div>
            
            <Slider
              value={[newRuleValue]}
              onValueChange={(value) => setNewRuleValue(value[0])}
              max={100}
              step={1}
              className="my-4"
            />
            
            <Button 
              onClick={handleAddRule} 
              className="w-full mt-2"
              disabled={!newRuleName}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Commission Rule
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
