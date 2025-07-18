
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeamMemberProfile, CommissionRule, CommissionFee } from "@/types/team-member";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRBAC } from "@/components/auth/RBACProvider";
import { BaseRateSection } from "./commission/BaseRateSection";
import { CommissionRulesSection } from "./commission/CommissionRulesSection";
import { FeesSection } from "./commission/FeesSection";
import { UpdateTeamMemberCommissionParams } from "@/types/database";

interface CommissionsTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const CommissionsTab = ({ member, isEditing }: CommissionsTabProps) => {
  const [baseRate, setBaseRate] = useState(member.commissionRate || 50);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(member.commissionRules || []);
  const [commissionFees, setCommissionFees] = useState<CommissionFee[]>(member.commissionFees || []);
  const [isSaving, setIsSaving] = useState(false);
  const { hasPermission } = useRBAC();
  
  const canManageCommissions = hasPermission("users.edit");
  
  // Update state when member data changes
  useEffect(() => {
    if (member) {
      setBaseRate(member.commissionRate || 50);
      setCommissionRules(member.commissionRules || []);
      setCommissionFees(member.commissionFees || []);
    }
  }, [member]);
  
  const handleBaseRateChange = (value: number[]) => {
    if (!isEditing || !canManageCommissions) return;
    setBaseRate(value[0]);
  };
  
  const handleBaseRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || !canManageCommissions) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setBaseRate(value);
    }
  };
  
  const handleSaveCommissionChanges = async () => {
    if (!isEditing || !canManageCommissions || !member) return;
    
    setIsSaving(true);
    
    try {
      // Prepare the parameters for the RPC function
      const params: UpdateTeamMemberCommissionParams = {
        user_id: member.id,
        base_rate: baseRate,
        rules: commissionRules,
        fees: commissionFees
      };
      
      // Use a type assertion to work around the TypeScript error
      // This is temporary until Supabase types are updated
      const { error } = await supabase.rpc(
        "update_team_member_commission" as any,
        params
      );
        
      if (error) throw error;
      
      toast.success("Commission settings saved successfully");
    } catch (error: any) {
      console.error("Error saving commission settings:", error);
      toast.error("Failed to save commission settings");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddRule = (rule: CommissionRule) => {
    if (!isEditing || !canManageCommissions) return;
    setCommissionRules([...commissionRules, rule]);
    toast.success("Commission rule added");
  };
  
  const handleDeleteRule = (id: string) => {
    if (!isEditing || !canManageCommissions) return;
    setCommissionRules(commissionRules.filter(rule => rule.id !== id));
    toast.success("Commission rule removed");
  };
  
  const handleFeeToggle = (id: string) => {
    if (!isEditing || !canManageCommissions) return;
    setCommissionFees(commissionFees.map(fee => 
      fee.id === id 
        ? { ...fee, deductFromTotal: !fee.deductFromTotal } 
        : fee
    ));
  };
  
  const handleFeeValueChange = (id: string, value: number) => {
    if (!isEditing || !canManageCommissions) return;
    setCommissionFees(commissionFees.map(fee => 
      fee.id === id 
        ? { ...fee, value } 
        : fee
    ));
  };
  
  const handleAddFee = (fee: CommissionFee) => {
    if (!isEditing || !canManageCommissions) return;
    setCommissionFees([...commissionFees, fee]);
  };
  
  // If user doesn't have permission to edit
  if (!canManageCommissions && !isEditing) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                You don't have permission to manage commission settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Base Rate & Rules */}
      <div className="space-y-6">
        <BaseRateSection 
          baseRate={baseRate}
          isEditing={isEditing}
          canManageCommissions={canManageCommissions}
          isSaving={isSaving}
          onBaseRateChange={handleBaseRateChange}
          onBaseRateInputChange={handleBaseRateInputChange}
          onSave={handleSaveCommissionChanges}
        />
        
        <Separator className="my-6" />
        
        <CommissionRulesSection
          commissionRules={commissionRules}
          isEditing={isEditing}
          canManageCommissions={canManageCommissions}
          onDeleteRule={handleDeleteRule}
          onAddRule={handleAddRule}
        />
      </div>
      
      {/* Right Column - Fees */}
      <div className="space-y-6">
        <FeesSection
          commissionFees={commissionFees}
          baseRate={baseRate}
          commissionRules={commissionRules}
          isEditing={isEditing}
          canManageCommissions={canManageCommissions}
          onFeeToggle={handleFeeToggle}
          onFeeValueChange={handleFeeValueChange}
          onAddFee={handleAddFee}
        />
      </div>
    </div>
  );
};
