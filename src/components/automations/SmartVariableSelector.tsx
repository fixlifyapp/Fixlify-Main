import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Phone, MapPin, Calendar, DollarSign, Wrench, 
  Building, Clock, TrendingUp, Brain, Search, Copy 
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartVariable {
  key: string;
  label: string;
  category: 'customer' | 'job' | 'company' | 'ai_generated' | 'calculated';
  description: string;
  example: string;
  icon: any;
  relevance: 'high' | 'medium' | 'low';
  availability: string[]; // Which triggers this variable works with
}

interface SmartVariableSelectorProps {
  triggerType: string;
  messageType: 'sms' | 'email';
  onVariableSelect: (variable: SmartVariable) => void;
}

export const SmartVariableSelector = ({ 
  triggerType, 
  messageType, 
  onVariableSelect 
}: SmartVariableSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  // Complete variable library
  const allVariables: SmartVariable[] = [
    // Customer Variables
    { key: 'client_name', label: 'Client Name', category: 'customer', description: 'Customer\'s full name', example: 'John Smith', icon: User, relevance: 'high', availability: ['*'] },
    { key: 'client_first_name', label: 'Client First Name', category: 'customer', description: 'Customer\'s first name only', example: 'John', icon: User, relevance: 'high', availability: ['*'] },
    { key: 'client_phone', label: 'Client Phone', category: 'customer', description: 'Customer\'s phone number', example: '(555) 123-4567', icon: Phone, relevance: 'medium', availability: ['*'] },
    { key: 'client_email', label: 'Client Email', category: 'customer', description: 'Customer\'s email address', example: 'john@example.com', icon: User, relevance: 'medium', availability: ['*'] },
    { key: 'client_address', label: 'Client Address', category: 'customer', description: 'Customer\'s service address', example: '123 Main St', icon: MapPin, relevance: 'high', availability: ['*'] },
    { key: 'client_city', label: 'Client City', category: 'customer', description: 'Customer\'s city', example: 'New York', icon: MapPin, relevance: 'medium', availability: ['*'] },
    { key: 'client_zip', label: 'Client ZIP', category: 'customer', description: 'Customer\'s ZIP code', example: '10001', icon: MapPin, relevance: 'low', availability: ['*'] },

    // Job Variables
    { key: 'job_id', label: 'Job ID', category: 'job', description: 'Unique job identifier', example: 'JOB-001', icon: Wrench, relevance: 'medium', availability: ['job_*'] },
    { key: 'job_title', label: 'Job Title', category: 'job', description: 'Brief job description', example: 'HVAC Repair', icon: Wrench, relevance: 'high', availability: ['job_*'] },
    { key: 'job_type', label: 'Job Type', category: 'job', description: 'Category of work', example: 'Maintenance', icon: Wrench, relevance: 'high', availability: ['job_*'] },
    { key: 'job_status', label: 'Job Status', category: 'job', description: 'Current job status', example: 'Scheduled', icon: Clock, relevance: 'medium', availability: ['job_*'] },
    { key: 'job_priority', label: 'Job Priority', category: 'job', description: 'Urgency level', example: 'High', icon: TrendingUp, relevance: 'medium', availability: ['job_*'] },
    { key: 'scheduled_date', label: 'Scheduled Date', category: 'job', description: 'Appointment date', example: 'March 15, 2024', icon: Calendar, relevance: 'high', availability: ['appointment_*', 'job_scheduled'] },
    { key: 'scheduled_time', label: 'Scheduled Time', category: 'job', description: 'Appointment time', example: '2:00 PM', icon: Clock, relevance: 'high', availability: ['appointment_*', 'job_scheduled'] },
    { key: 'total_amount', label: 'Total Amount', category: 'job', description: 'Job total cost', example: '$450.00', icon: DollarSign, relevance: 'high', availability: ['estimate_sent', 'invoice_*'] },
    { key: 'technician_name', label: 'Technician Name', category: 'job', description: 'Assigned technician', example: 'Mike Johnson', icon: User, relevance: 'high', availability: ['job_*', 'appointment_*'] },
    { key: 'technician_phone', label: 'Technician Phone', category: 'job', description: 'Technician contact', example: '(555) 987-6543', icon: Phone, relevance: 'medium', availability: ['job_*', 'appointment_*'] },
    // Company Variables
    { key: 'company_name', label: 'Company Name', category: 'company', description: 'Your business name', example: 'Fixlify Services', icon: Building, relevance: 'high', availability: ['*'] },
    { key: 'company_phone', label: 'Company Phone', category: 'company', description: 'Main business number', example: '(555) 999-0000', icon: Phone, relevance: 'high', availability: ['*'] },
    { key: 'company_email', label: 'Company Email', category: 'company', description: 'Main business email', example: 'info@fixlify.com', icon: User, relevance: 'medium', availability: ['*'] },
    { key: 'company_address', label: 'Company Address', category: 'company', description: 'Business address', example: '456 Business Ave', icon: MapPin, relevance: 'low', availability: ['*'] },
    { key: 'company_website', label: 'Company Website', category: 'company', description: 'Business website', example: 'www.fixlify.com', icon: Building, relevance: 'medium', availability: ['*'] },
    { key: 'booking_link', label: 'Online Booking Link', category: 'company', description: 'Direct booking URL', example: 'https://book.fixlify.com', icon: Calendar, relevance: 'high', availability: ['missed_call', 'customer_inquiry'] },

    // AI-Generated Variables
    { key: 'ai_personalized_greeting', label: 'AI Personalized Greeting', category: 'ai_generated', description: 'Context-aware greeting', example: 'Hope your HVAC system is running smoothly!', icon: Brain, relevance: 'high', availability: ['*'] },
    { key: 'ai_next_action', label: 'AI Suggested Action', category: 'ai_generated', description: 'Smart next step recommendation', example: 'Schedule maintenance to avoid winter issues', icon: Brain, relevance: 'high', availability: ['*'] },
    { key: 'ai_urgency_level', label: 'AI Urgency Assessment', category: 'ai_generated', description: 'AI-determined priority', example: 'This requires immediate attention', icon: Brain, relevance: 'medium', availability: ['*'] },
    { key: 'ai_weather_context', label: 'AI Weather Context', category: 'ai_generated', description: 'Weather-relevant messaging', example: 'With cold weather coming...', icon: Brain, relevance: 'medium', availability: ['*'] },
    { key: 'ai_service_recommendation', label: 'AI Service Recommendation', category: 'ai_generated', description: 'Tailored service suggestion', example: 'Consider our maintenance plan', icon: Brain, relevance: 'high', availability: ['job_completed', 'estimate_sent'] },

    // Calculated Variables
    { key: 'days_since_last_service', label: 'Days Since Last Service', category: 'calculated', description: 'Time since last visit', example: '45 days', icon: Clock, relevance: 'medium', availability: ['*'] },
    { key: 'customer_lifetime_value', label: 'Customer Value Score', category: 'calculated', description: 'Total customer value', example: '$2,450', icon: DollarSign, relevance: 'medium', availability: ['*'] },
    { key: 'time_until_appointment', label: 'Time Until Appointment', category: 'calculated', description: 'Countdown to appointment', example: '2 hours', icon: Clock, relevance: 'high', availability: ['appointment_*'] },
    { key: 'overdue_amount', label: 'Overdue Amount', category: 'calculated', description: 'Total overdue balance', example: '$350.00', icon: DollarSign, relevance: 'high', availability: ['invoice_overdue'] },
    { key: 'seasonal_message', label: 'Seasonal Context', category: 'calculated', description: 'Season-appropriate messaging', example: 'Spring is perfect for AC tune-ups!', icon: Calendar, relevance: 'medium', availability: ['*'] }
  ];
  // Filter variables based on trigger type and search
  const getRelevantVariables = (category?: string) => {
    let filtered = allVariables;

    // Filter by availability for trigger type
    if (triggerType) {
      filtered = filtered.filter(variable => 
        variable.availability.includes('*') || 
        variable.availability.some(avail => 
          triggerType.includes(avail.replace('*', '')) || 
          avail.includes(triggerType.split('_')[0])
        )
      );
    }

    // Filter by category
    if (category && category !== 'recommended') {
      filtered = filtered.filter(variable => variable.category === category);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(variable => 
        variable.label.toLowerCase().includes(query) ||
        variable.key.toLowerCase().includes(query) ||
        variable.description.toLowerCase().includes(query)
      );
    }

    // For recommended, sort by relevance
    if (category === 'recommended') {
      filtered = filtered.sort((a, b) => {
        const relevanceOrder = { high: 3, medium: 2, low: 1 };
        return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
      }).slice(0, 12); // Top 12 most relevant
    }

    return filtered;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-700 border-blue-200',
      job: 'bg-green-100 text-green-700 border-green-200',
      company: 'bg-purple-100 text-purple-700 border-purple-200',
      ai_generated: 'bg-orange-100 text-orange-700 border-orange-200',
      calculated: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRelevanceBadge = (relevance: string) => {
    const variants: Record<string, string> = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-600'
    };
    return variants[relevance] || variants.low;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Smart Variables
          <Badge variant="secondary" className="ml-auto">
            {triggerType ? `For ${triggerType}` : 'All triggers'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="recommended">Top</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="ai_generated">AI</TabsTrigger>
              <TabsTrigger value="calculated">Smart</TabsTrigger>
            </TabsList>
            {['recommended', 'customer', 'job', 'company', 'ai_generated', 'calculated'].map(category => (
              <TabsContent key={category} value={category} className="space-y-3">
                {getRelevantVariables(category).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No variables found</p>
                    <p className="text-sm">Try adjusting your search or category</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {getRelevantVariables(category).map((variable) => {
                      const IconComponent = variable.icon;
                      return (
                        <Button
                          key={variable.key}
                          variant="ghost"
                          className={`h-auto p-3 justify-start border ${getCategoryColor(variable.category)} hover:bg-opacity-50`}
                          onClick={() => onVariableSelect(variable)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{variable.label}</span>
                                <Badge className={getRelevanceBadge(variable.relevance)}>
                                  {variable.relevance}
                                </Badge>
                                {variable.category === 'ai_generated' && (
                                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                {variable.description}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {`{{${variable.key}}} → ${variable.example}`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(`{{${variable.key}}}`);
                                  toast.success('Copied to clipboard');
                                }}
                                className="p-1 h-6 w-6"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          {/* Quick Insert Popular Variables */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Quick Insert:</div>
            <div className="flex flex-wrap gap-2">
              {['client_name', 'job_title', 'scheduled_date', 'company_phone', 'ai_next_action'].map(key => {
                const variable = allVariables.find(v => v.key === key);
                if (!variable) return null;
                
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => onVariableSelect(variable)}
                    className="text-xs"
                  >
                    {variable.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};