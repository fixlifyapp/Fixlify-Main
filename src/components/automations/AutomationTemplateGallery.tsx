
import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Search, 
  Phone, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Mail, 
  TrendingUp,
  Zap,
  Clock,
  Users,
  Award,
  Sparkles,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomationTemplateGalleryProps {
  templates: any[];
  recommendedTemplates: any[];
  categories: any[];
  onUseTemplate: (template: any) => void;
}

export const AutomationTemplateGallery = ({ 
  templates, 
  recommendedTemplates, 
  categories, 
  onUseTemplate 
}: AutomationTemplateGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, any> = {
      missed_call: Phone,
      appointment: Calendar,
      payment: DollarSign,
      review: Star,
      estimate: Mail,
      customer_journey: TrendingUp
    };
    return icons[categoryId] || Zap;
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const TemplateCard = ({ template, isRecommended = false }: { template: any, isRecommended?: boolean }) => {
    const CategoryIcon = getCategoryIcon(template.category);
    
    return (
      <ModernCard 
        variant="elevated" 
        hoverable 
        className={cn(
          "group transition-all duration-300 h-full",
          isRecommended && "ring-2 ring-purple-500/30 shadow-lg bg-gradient-to-br from-purple-50/50 to-white"
        )}
      >
        <ModernCardContent className="p-6 h-full flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                    {template.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {template.is_featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {isRecommended && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {template.usage_count || 0}
                </div>
                {template.success_rate && (
                  <div className="flex items-center gap-1 mt-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {template.success_rate}%
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-3 flex-1">
              {template.description}
            </p>

            {/* Benefits */}
            <div className="space-y-2">
              {template.estimated_time_saved && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Saves {template.estimated_time_saved}
                </div>
              )}
              {template.average_revenue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Avg Revenue: ${template.average_revenue}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags?.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags?.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <GradientButton
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Template card clicked:', template);
                onUseTemplate(template);
              }}
              className="flex-1 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Play className="w-4 h-4 mr-1" />
              Use Template
            </GradientButton>
            <Button size="sm" variant="outline" className="border-gray-200 hover:border-purple-300">
              Preview
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'border-gray-200 hover:border-purple-300'}
          >
            All Templates
          </Button>
          {categories.filter(cat => cat.id !== 'all').map((category) => {
            const Icon = getCategoryIcon(category.id);
            return (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-1",
                  selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'border-gray-200 hover:border-purple-300'
                )}
              >
                <Icon className="w-3 h-3" />
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.templateCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
          <TabsTrigger 
            value="recommended"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Recommended
          </TabsTrigger>
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
          >
            <Star className="w-4 h-4 mr-2" />
            All Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {recommendedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isRecommended />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600">Complete your profile setup to get personalized template recommendations.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to find more templates.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
