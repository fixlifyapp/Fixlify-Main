import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Mail, Phone, Zap } from "lucide-react";

interface ConnectCenterKPICardsProps {
  className?: string;
}

export const ConnectCenterKPICards = ({ className }: ConnectCenterKPICardsProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalEmails: 0,
    totalCalls: 0,
    activeAutomations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchStats();
  }, [user?.id]);

  const fetchStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get message count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // SMS Messages count
      const { count: smsCount } = await supabase
        .from('sms_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Email count
      const { count: emailCount } = await supabase
        .from('communication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'email')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Call count
      const { count: callCount } = await supabase
        .from('communication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'call')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Active automations
      const { count: automationCount } = await supabase
        .from('communication_automations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setStats({
        totalMessages: smsCount || 0,
        totalEmails: emailCount || 0,
        totalCalls: callCount || 0,
        activeAutomations: automationCount || 0
      });
    } catch (error) {
      console.error('Error fetching connect center stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Messages",
      value: stats.totalMessages,
      label: "SMS sent (30 days)",
      icon: MessageSquare,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Emails",
      value: stats.totalEmails,
      label: "Emails sent (30 days)",
      icon: Mail,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Calls",
      value: stats.totalCalls,
      label: "Calls made (30 days)",
      icon: Phone,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Automations",
      value: stats.activeAutomations,
      label: "Active workflows",
      icon: Zap,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200"
    }
  ];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6 animate-pulse"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} ${card.bgColor} p-6 transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  <p className={`text-sm font-medium ${card.iconColor}`}>
                    {card.title}
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {card.label}
                </p>
              </div>
            </div>
            {/* Decorative background element */}
            <div 
              className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${card.bgColor} opacity-50`}
            />
          </div>
        );
      })}
    </div>
  );
};
