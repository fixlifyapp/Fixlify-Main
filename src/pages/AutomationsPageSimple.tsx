import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Plus, Brain, Search, Filter, Database,
  Workflow, Activity, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';

const AutomationsPageSimple = () => {
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { organization } = useOrganization();

  // Fetch automations
  useEffect(() => {
    if (user?.id) {
      fetchAutomations();
    }
  }, [user?.id]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomationRules(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  };

  const filteredAutomations = automationRules.filter(rule =>
    rule.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <PageHeader
        title="Automations"
        subtitle="Streamline your business with AI-powered automation"
        icon={Zap}
        actionButton={{
          text: "Create Automation",
          icon: Plus,
          onClick: () => toast.info("Create automation functionality coming soon")
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ModernCard variant="elevated">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Automations</p>
                <p className="text-2xl font-bold text-fixlyfy">
                  {automationRules.filter(r => r.is_active).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-fixlyfy/20" />
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600/20" />
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">0%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600/20" />
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Search and Filter */}
      <ModernCard variant="elevated" className="mb-6">
        <ModernCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Automations List */}
      <div className="space-y-4">
        {loading ? (
          <ModernCard variant="elevated">
            <ModernCardContent className="p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading automations...</p>
            </ModernCardContent>
          </ModernCard>
        ) : filteredAutomations.length === 0 ? (
          <ModernCard variant="elevated">
            <ModernCardContent className="p-12 text-center">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
              <p className="text-gray-600 mb-6">
                Start creating automations to streamline your business processes
              </p>
              <GradientButton variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Automation
              </GradientButton>
            </ModernCardContent>
          </ModernCard>
        ) : (
          filteredAutomations.map((rule) => (
            <ModernCard key={rule.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <ModernCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-fixlyfy/10 rounded-lg">
                      <Workflow className="h-6 w-6 text-fixlyfy" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default AutomationsPageSimple;
