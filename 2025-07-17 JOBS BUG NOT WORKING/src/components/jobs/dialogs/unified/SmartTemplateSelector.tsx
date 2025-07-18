import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, DollarSign, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineItem, Product } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  items: Product[];
  estimatedTotal: number;
  serviceType: string;
  averageTime: string;
}

interface SmartTemplateSelectorProps {
  jobData: any;
  onSelectTemplate: (items: Product[]) => void;
  className?: string;
}

export const SmartTemplateSelector = ({
  jobData,
  onSelectTemplate,
  className
}: SmartTemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jobData?.service) {
      loadSmartTemplates();
    }
  }, [jobData]);

  const loadSmartTemplates = async () => {
    setIsLoading(true);
    try {
      // Get common products for this service type
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .or(`tags.cs.{${jobData.service}},category.ilike.%${jobData.service}%`)
        .limit(10);

      if (products && products.length > 0) {
        // Create smart templates based on service type and historical data
        const smartTemplates = generateSmartTemplates(products, jobData);
        setTemplates(smartTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartTemplates = (products: any[], job: any): Template[] => {
    const templates: Template[] = [];

    // Basic service template
    const basicItems = products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      cost: p.cost || 0,
      ourPrice: p.ourprice || p.cost || 0,
      category: p.category,
      taxable: p.taxable,
      tags: p.tags || [],
      quantity: 1
    }));

    if (basicItems.length > 0) {
      templates.push({
        id: 'basic',
        name: `Basic ${job.service || 'Service'}`,
        description: 'Essential items for standard service',
        items: basicItems,
        estimatedTotal: basicItems.reduce((sum, item) => sum + item.price, 0),
        serviceType: job.service || 'General',
        averageTime: '2-3 hours'
      });
    }

    // Premium service template
    const premiumItems = products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price * 1.2, // 20% premium pricing
      cost: p.cost || 0,
      ourPrice: p.ourprice || p.cost || 0,
      category: p.category,
      taxable: p.taxable,
      tags: p.tags || [],
      quantity: 1
    }));

    if (premiumItems.length > 2) {
      templates.push({
        id: 'premium',
        name: `Premium ${job.service || 'Service'}`,
        description: 'Comprehensive service with premium parts',
        items: premiumItems,
        estimatedTotal: premiumItems.reduce((sum, item) => sum + item.price, 0),
        serviceType: job.service || 'General',
        averageTime: '4-6 hours'
      });
    }

    // Emergency/urgent template
    if (job.tags?.includes('urgent') || job.tags?.includes('emergency')) {
      const emergencyItems = basicItems.map(item => ({
        ...item,
        price: item.price * 1.5, // 50% emergency surcharge
        description: `${item.description} (Emergency Service)`
      }));

      templates.push({
        id: 'emergency',
        name: `Emergency ${job.service || 'Service'}`,
        description: 'Expedited service with emergency pricing',
        items: emergencyItems,
        estimatedTotal: emergencyItems.reduce((sum, item) => sum + item.price, 0),
        serviceType: job.service || 'General',
        averageTime: '1-2 hours'
      });
    }

    return templates;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4 animate-pulse" />
            <span>Loading smart templates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Smart Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {template.items.length} items
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(template.estimatedTotal)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.averageTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {template.serviceType}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectTemplate(template.items)}
                className="text-xs"
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
