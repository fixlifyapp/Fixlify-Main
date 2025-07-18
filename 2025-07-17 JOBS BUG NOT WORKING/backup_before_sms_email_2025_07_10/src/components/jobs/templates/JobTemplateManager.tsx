import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText,
  Plus,
  Copy,
  Edit,
  Trash2,
  Star,
  Clock,
  DollarSign
} from "lucide-react";

interface JobTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  estimatedCost: number;
  tasks: string[];
  materials: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  isDefault: boolean;
  usageCount: number;
}

interface JobTemplateManagerProps {
  onUseTemplate?: (template: JobTemplate) => void;
}

export const JobTemplateManager = ({ onUseTemplate }: JobTemplateManagerProps) => {
  const [templates, setTemplates] = useState<JobTemplate[]>([
    {
      id: "temp1",
      name: "Dishwasher Repair - Not Draining",
      description: "Standard repair procedure for dishwashers with drainage issues",
      category: "Appliance Repair",
      estimatedDuration: 2,
      estimatedCost: 150,
      tasks: [
        "Inspect drain hose for clogs",
        "Check garbage disposal connection",
        "Clean dishwasher filter",
        "Test water pump",
        "Verify proper installation"
      ],
      materials: [
        { name: "Drain Hose", quantity: 1, cost: 25 },
        { name: "Filter Replacement", quantity: 1, cost: 15 }
      ],
      isDefault: true,
      usageCount: 23
    },
    {
      id: "temp2",
      name: "Washing Machine - Won't Spin",
      description: "Diagnostic and repair for washing machines with spin cycle issues",
      category: "Appliance Repair",
      estimatedDuration: 1.5,
      estimatedCost: 120,
      tasks: [
        "Check lid switch functionality",
        "Inspect drive belt",
        "Test motor coupling",
        "Verify load balance",
        "Check control board"
      ],
      materials: [
        { name: "Drive Belt", quantity: 1, cost: 30 },
        { name: "Lid Switch", quantity: 1, cost: 20 }
      ],
      isDefault: false,
      usageCount: 18
    },
    {
      id: "temp3",
      name: "HVAC Maintenance - Seasonal",
      description: "Comprehensive seasonal HVAC maintenance checklist",
      category: "Maintenance",
      estimatedDuration: 3,
      estimatedCost: 200,
      tasks: [
        "Replace air filters",
        "Clean evaporator coils",
        "Check refrigerant levels",
        "Inspect ductwork",
        "Test thermostat calibration",
        "Lubricate moving parts"
      ],
      materials: [
        { name: "Air Filter", quantity: 2, cost: 25 },
        { name: "Coil Cleaner", quantity: 1, cost: 15 }
      ],
      isDefault: false,
      usageCount: 31
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<JobTemplate>>({
    name: "",
    description: "",
    category: "",
    estimatedDuration: 2,
    estimatedCost: 100,
    tasks: [],
    materials: []
  });

  const handleUseTemplate = (template: JobTemplate) => {
    console.log("Using template:", template);
    onUseTemplate?.(template);
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
  };

  const handleCreateTemplate = () => {
    const template: JobTemplate = {
      id: `temp${templates.length + 1}`,
      name: newTemplate.name || "",
      description: newTemplate.description || "",
      category: newTemplate.category || "",
      estimatedDuration: newTemplate.estimatedDuration || 2,
      estimatedCost: newTemplate.estimatedCost || 100,
      tasks: newTemplate.tasks || [],
      materials: newTemplate.materials || [],
      isDefault: false,
      usageCount: 0
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: "",
      description: "",
      category: "",
      estimatedDuration: 2,
      estimatedCost: 100,
      tasks: [],
      materials: []
    });
    setIsCreateModalOpen(false);
  };

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Templates
          </CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Job Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for common job types.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Refrigerator Not Cooling"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Input
                      id="template-category"
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Appliance Repair"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this job type..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-duration">Estimated Duration (hours)</Label>
                    <Input
                      id="template-duration"
                      type="number"
                      value={newTemplate.estimatedDuration}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) }))}
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-cost">Estimated Cost ($)</Label>
                    <Input
                      id="template-cost"
                      type="number"
                      value={newTemplate.estimatedCost}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) }))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="cursor-pointer">All</Badge>
          {categories.map(category => (
            <Badge key={category} variant="secondary" className="cursor-pointer">
              {category}
            </Badge>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      {template.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{template.estimatedDuration}h</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>${template.estimatedCost}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Copy className="h-4 w-4 text-purple-600" />
                        <span>{template.usageCount} uses</span>
                      </div>
                    </div>

                    {template.tasks.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Tasks: </span>
                        <span className="text-muted-foreground">
                          {template.tasks.slice(0, 2).join(", ")}
                          {template.tasks.length > 2 && ` +${template.tasks.length - 2} more`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first job template to speed up job creation.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
