import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useTags } from '@/hooks/useTags';

interface TriggerTagsChangeConfigProps {
  config: any;
  onUpdate: (config: any) => void;
  isClientTags?: boolean;
}

export const TriggerTagsChangeConfig: React.FC<TriggerTagsChangeConfigProps> = ({ 
  config, 
  onUpdate,
  isClientTags = false
}) => {
  const { tags } = useTags();
  
  // Filter tags by type
  const relevantTags = tags.filter(tag => 
    isClientTags ? tag.entity_type === 'client' : tag.entity_type === 'job'
  );
  
  const selectedAddedTags = config.tags_added || [];
  const selectedRemovedTags = config.tags_removed || [];
  
  const addTag = (tagId: string, type: 'added' | 'removed') => {
    if (type === 'added') {
      if (!selectedAddedTags.includes(tagId)) {
        onUpdate({ 
          ...config, 
          tags_added: [...selectedAddedTags, tagId],
          tags_removed: selectedRemovedTags.filter((id: string) => id !== tagId)
        });
      }
    } else {
      if (!selectedRemovedTags.includes(tagId)) {
        onUpdate({ 
          ...config, 
          tags_removed: [...selectedRemovedTags, tagId],
          tags_added: selectedAddedTags.filter((id: string) => id !== tagId)
        });
      }
    }
  };
  
  const removeTag = (tagId: string, type: 'added' | 'removed') => {
    if (type === 'added') {
      onUpdate({ 
        ...config, 
        tags_added: selectedAddedTags.filter((id: string) => id !== tagId)
      });
    } else {
      onUpdate({ 
        ...config, 
        tags_removed: selectedRemovedTags.filter((id: string) => id !== tagId)
      });
    }
  };
  
  return (
    <div className="space-y-3 p-3 bg-muted/10 rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        {isClientTags ? 'Client' : 'Job'} Tags Change Configuration
      </div>
      
      <div className="space-y-4">
        {/* Tags Added */}
        <div className="space-y-2">
          <Label className="text-xs">When these tags are added:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedAddedTags.map((tagId: string) => {
              const tag = relevantTags.find(t => t.id === tagId);
              return tag ? (
                <Badge 
                  key={tagId} 
                  style={{ backgroundColor: tag.color }}
                  className="gap-1"
                >
                  {tag.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tagId, 'added')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
            
            <Select
              value=""
              onValueChange={(value) => addTag(value, 'added')}
            >
              <SelectTrigger className="w-32 h-7">
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </SelectTrigger>
              <SelectContent>
                {relevantTags
                  .filter(tag => !selectedAddedTags.includes(tag.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Removed */}
        <div className="space-y-2">
          <Label className="text-xs">When these tags are removed:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedRemovedTags.map((tagId: string) => {
              const tag = relevantTags.find(t => t.id === tagId);
              return tag ? (
                <Badge 
                  key={tagId} 
                  variant="outline"
                  className="gap-1"
                >
                  {tag.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tagId, 'removed')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
            
            <Select
              value=""
              onValueChange={(value) => addTag(value, 'removed')}
            >
              <SelectTrigger className="w-32 h-7">
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </SelectTrigger>
              <SelectContent>
                {relevantTags
                  .filter(tag => !selectedRemovedTags.includes(tag.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Triggers when specific tags are added to or removed from a {isClientTags ? 'client' : 'job'}.
        Leave empty to trigger on any tag change.
      </div>
    </div>
  );
};
