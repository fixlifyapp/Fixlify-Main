import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface UnifiedTagsSelectorProps {
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  tags: any[];
  isLoading?: boolean;
  label?: string;
  showManageLink?: boolean;
  className?: string;
  maxHeight?: string;
}

export const UnifiedTagsSelector = ({
  selectedTags,
  onTagToggle,
  tags,
  isLoading = false,
  label = "Tags",
  showManageLink = true,
  className = "",
  maxHeight = "200px",
}: UnifiedTagsSelectorProps) => {
  // Group tags by category
  const tagsByCategory = tags.reduce((acc, tag) => {
    const category = tag.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <div className="flex items-center justify-center py-4">
          <span className="text-sm text-muted-foreground">Loading tags...</span>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <Label>{label}</Label>
          {showManageLink && (
            <Link to="/settings/configuration">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
            </Link>
          )}
        </div>
        <div className="flex items-center justify-center py-4 border border-dashed rounded-lg">
          <div className="text-center">
            <Tag className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No tags available</p>
            {showManageLink && (
              <Link to="/settings/configuration">
                <Button variant="outline" size="sm" className="mt-2">
                  Create Tags
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        {showManageLink && (
          <Link to="/settings/configuration">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Settings className="w-3 h-3 mr-1" />
              Manage
            </Button>
          </Link>
        )}
      </div>
      <div 
        className="space-y-3 overflow-y-auto border rounded-lg p-3"
        style={{ maxHeight }}
      >
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => onTagToggle(tag.id)}
                  style={tag.color && selectedTags.includes(tag.name) ? 
                    { backgroundColor: tag.color, color: 'white' } : 
                    tag.color ? { borderColor: tag.color, color: tag.color } : {}
                  }
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};