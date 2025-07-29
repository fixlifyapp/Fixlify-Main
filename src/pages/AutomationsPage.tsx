import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { UnifiedAutomationSystem } from '@/components/automations/UnifiedAutomationSystem';
import { Zap, Bot, TrendingUp, Settings } from "lucide-react";

const AutomationsPage = () => {
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="AI Automation Center"
          subtitle="Create intelligent workflows and automate your business processes"
          icon={Zap}
          badges={[
            { text: "AI Powered", icon: Bot, variant: "fixlyfy" },
            { text: "Smart Workflows", icon: Settings, variant: "info" },
            { text: "Performance", icon: TrendingUp, variant: "success" }
          ]}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <UnifiedAutomationSystem />
      </AnimatedContainer>
    </PageLayout>
  );
};

export default AutomationsPage;