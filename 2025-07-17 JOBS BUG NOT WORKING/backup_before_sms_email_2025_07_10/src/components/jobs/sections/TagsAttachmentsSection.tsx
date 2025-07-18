
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit } from "lucide-react";

interface Attachment {
  id: number;
  name: string;
  size: string;
}

interface TagsAttachmentsSectionProps {
  tags: string[];
  attachments: Attachment[];
  onTagsEdit: () => void;
  onAttachmentsEdit: () => void;
  getTagColor: (tag: string) => string;
}

export const TagsAttachmentsSection = ({ 
  tags, 
  attachments, 
  onTagsEdit, 
  onAttachmentsEdit, 
  getTagColor 
}: TagsAttachmentsSectionProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tags & Attachments</h3>
        </div>
        
        <div className="space-y-4">
          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tags</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTagsEdit}
              >
                <Edit size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`flex items-center gap-1 ${getTagColor(tag)}`}
                  onClick={onTagsEdit}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Attachments ({attachments.length} files)</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAttachmentsEdit}
              >
                <Edit size={16} />
              </Button>
            </div>
            <div className="space-y-3 cursor-pointer" onClick={onAttachmentsEdit}>
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-gray-500" />
                    <span>{attachment.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{attachment.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
