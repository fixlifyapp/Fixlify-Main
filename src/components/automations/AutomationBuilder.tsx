import React, { useState, useEffect } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GradientButton } from '@/components/ui/gradient-button';
import { 
  Zap, CheckCircle, Plus, Trash2, Clock, MessageSquare, Mail, 
  Settings, Brain, Sparkles, Copy, User, Phone, MapPin, Calendar,
  DollarSign, Building, TrendingUp, Target, ArrowRight, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { AIMessageEnhancer } from './AIMessageEnhancer';
import { SmartVariableSelector } from './SmartVariableSelector';

interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    type: string;
    conditions?: any[];
  };
  conditions?: {
    operator: 'AND' | 'OR';
    rules: any[];
  };
  action: {
    type: string;
    config: any;
    delay?: { type: string; value?: number };
  };
  deliveryWindow: {
    businessHoursOnly: boolean;
    allowedDays: string[];
    timeRange?: { start: string; end: string };
  };
  multiChannel: {
    primaryChannel: 'sms' | 'email';
    fallbackEnabled: boolean;
    fallbackChannel?: 'sms' | 'email';
    fallbackDelayHours: number;
  };
}
interface AutomationBuilderProps {
  rule: AutomationRule | null;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
  triggerTypes: any[];
  actionTypes: any[];
}

export const AutomationBuilder = ({ 
  rule, 
  onSave, 
  onCancel, 
  triggerTypes, 
  actionTypes 
}: AutomationBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [formData, setFormData] = useState<AutomationRule>({
    name: '',
    description: '',
    status: 'draft',
    trigger: { type: '', conditions: [] },
    conditions: { operator: 'AND', rules: [] },
    action: { 
      type: '', 
      config: { message: '', subject: '' }, 
      delay: { type: 'immediate', value: 0 } 
    },
    deliveryWindow: {
      businessHoursOnly: false,
      allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      timeRange: { start: '09:00', end: '17:00' }
    },
    multiChannel: {
      primaryChannel: 'sms',
      fallbackEnabled: false,
      fallbackChannel: 'email',
      fallbackDelayHours: 2
    }
  });

  // Initialize with rule data if editing
  useEffect(() => {
    if (rule) {
      setFormData(rule);
    }
  }, [rule]);

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  // Get condition fields based on trigger type
  const getConditionFields = (triggerType: string) => {
    const baseFields = [
      { value: 'job_type', label: 'Job Type', type: 'select' },
      { value: 'job_priority', label: 'Job Priority', type: 'select' },
      { value: 'customer_tag', label: 'Customer Tag', type: 'select' },
      { value: 'job_value', label: 'Job Value', type: 'number' },
      { value: 'customer_type', label: 'Customer Type', type: 'select' },
      { value: 'technician', label: 'Assigned Technician', type: 'select' },
      { value: 'service_area', label: 'Service Area', type: 'select' }
    ];

    // Add trigger-specific fields
    if (triggerType === 'invoice_overdue') {
      baseFields.push(
        { value: 'days_overdue', label: 'Days Overdue', type: 'number' },
        { value: 'overdue_amount', label: 'Overdue Amount', type: 'number' }
      );
    }

    if (triggerType === 'job_completed') {
      baseFields.push(
        { value: 'completion_rating', label: 'Completion Rating', type: 'number' },
        { value: 'completion_notes', label: 'Has Completion Notes', type: 'boolean' }
      );
    }

    return baseFields;
  };

  const addCondition = () => {
    const newCondition = { field: '', operator: 'equals', value: '' };
    updateFormData('conditions.rules', [...(formData.conditions?.rules || []), newCondition]);
    if (!formData.conditions?.operator) {
      updateFormData('conditions.operator', 'AND');
    }
  };

  const removeCondition = (index: number) => {
    const newRules = formData.conditions?.rules.filter((_, i) => i !== index) || [];
    updateFormData('conditions.rules', newRules);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an automation name');
      return;
    }
    if (!formData.trigger.type) {
      toast.error('Please select a trigger');
      return;
    }
    if (!formData.action.type) {
      toast.error('Please select an action');
      return;
    }
    
    onSave(formData);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.trigger.type !== '';
      case 3:
        return true; // Conditions are optional
      case 4:
        return formData.action.type !== '';
      case 5:
        return true; // Settings are optional
      default:
        return true;
    }
  };
  const steps = [
    { step: 1, title: 'Basic Info', icon: '📝' },
    { step: 2, title: 'When', icon: '⚡' },
    { step: 3, title: 'Only if', icon: '🎯' },
    { step: 4, title: 'Do this', icon: '🚀' },
    { step: 5, title: 'Delivery', icon: '⏰' }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        {steps.map(({ step, title, icon }) => (
          <div key={step} className="flex items-center gap-2">
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= step 
                  ? 'bg-gradient-to-r from-fixlyfy to-fixlyfy-light text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => setCurrentStep(step)}
              disabled={!validateStep(step - 1)}
            >
              {icon}
            </button>
            <span className={`text-sm ${currentStep >= step ? 'text-fixlyfy font-medium' : 'text-gray-600'}`}>
              {title}
            </span>
            {step < 5 && <div className="w-8 h-0.5 bg-gray-300"></div>}
          </div>
        ))}
      </div>
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Settings}>
              Basic Information
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Automation Name *</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Send appointment reminder"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule-description">Description (Optional)</Label>
              <Textarea
                id="rule-description"
                placeholder="Describe what this automation does..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Step 2: Trigger Selection */}
      {currentStep === 2 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Zap}>
              When this happens (Trigger)
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select trigger event *</Label>
              <Select value={formData.trigger.type} onValueChange={(value) => updateFormData('trigger.type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose when this automation should run..." />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div>
                        <div className="font-medium">{trigger.label}</div>
                        <div className="text-xs text-gray-500">{trigger.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.trigger.type && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">
                    This automation will run: {triggerTypes.find(t => t.value === formData.trigger.type)?.label}
                  </span>
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Step 3: Conditions (Optional) */}
      {currentStep === 3 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Target}>
              Only if these conditions are met (Optional)
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add conditions to make this automation more specific. Leave empty to trigger for all events.
            </p>
            
            {formData.conditions?.rules && formData.conditions.rules.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Condition Logic:</Label>
                  <Select 
                    value={formData.conditions.operator} 
                    onValueChange={(value) => updateFormData('conditions.operator', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">All conditions (AND)</SelectItem>
                      <SelectItem value="OR">Any condition (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.conditions.rules.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Select 
                      value={condition.field} 
                      onValueChange={(value) => updateFormData(`conditions.rules.${index}.field`, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getConditionFields(formData.trigger.type).map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>                    
                    <Select 
                      value={condition.operator} 
                      onValueChange={(value) => updateFormData(`conditions.rules.${index}.operator`, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Value..."
                      value={condition.value}
                      onChange={(e) => updateFormData(`conditions.rules.${index}.value`, e.target.value)}
                      className="flex-1"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button variant="outline" onClick={addCondition}>
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Step 4: Action Configuration */}
      {currentStep === 4 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={MessageSquare}>
              Do this (Action)
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select action *</Label>
              <Select value={formData.action.type} onValueChange={(value) => updateFormData('action.type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose what should happen..." />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div>
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Action-specific configuration */}
            {(formData.action.type === 'send_sms' || formData.action.type === 'send_email') && (
              <div className="space-y-4">
                {/* Multi-channel settings */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Channel Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Channel</Label>
                      <Select 
                        value={formData.multiChannel.primaryChannel} 
                        onValueChange={(value: any) => updateFormData('multiChannel.primaryChannel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms">SMS Text Message</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={formData.multiChannel.fallbackEnabled}
                          onCheckedChange={(checked) => updateFormData('multiChannel.fallbackEnabled', checked)}
                        />
                        Enable Fallback
                      </Label>                      {formData.multiChannel.fallbackEnabled && (
                        <div className="space-y-2">
                          <Select 
                            value={formData.multiChannel.fallbackChannel} 
                            onValueChange={(value: any) => updateFormData('multiChannel.fallbackChannel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Fallback channel..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sms">SMS Text Message</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Delay:</Label>
                            <Input
                              type="number"
                              min="1"
                              max="24"
                              value={formData.multiChannel.fallbackDelayHours}
                              onChange={(e) => updateFormData('multiChannel.fallbackDelayHours', parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-xs text-gray-500">hours</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Message content with AI helper */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Message Content *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIHelper(!showAIHelper)}
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      AI Helper
                    </Button>
                  </div>
                  
                  {formData.action.type === 'send_email' && (
                    <Input
                      placeholder="Email subject..."
                      value={formData.action.config.subject || ''}
                      onChange={(e) => updateFormData('action.config.subject', e.target.value)}
                    />
                  )}
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder={`Enter your ${formData.action.type === 'send_email' ? 'email' : 'SMS'} message...`}
                      value={formData.action.config.message || ''}
                      onChange={(e) => updateFormData('action.config.message', e.target.value)}
                      className="min-h-32"
                    />
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        Characters: {(formData.action.config.message || '').length}
                        {formData.multiChannel.primaryChannel === 'sms' && (formData.action.config.message || '').length > 160 && (
                          <Badge variant="destructive" className="ml-2">Over SMS limit</Badge>
                        )}
                      </span>
                      <span>Use {{variable_name}} for dynamic content</span>
                    </div>
                  </div>
                  {/* Smart Variable Selector */}
                  <SmartVariableSelector
                    triggerType={formData.trigger.type}
                    messageType={formData.multiChannel.primaryChannel}
                    onVariableSelect={(variable) => {
                      const currentMessage = formData.action.config.message || '';
                      const newMessage = currentMessage + `{{${variable.key}}}`;
                      updateFormData('action.config.message', newMessage);
                    }}
                  />

                  {/* AI Message Enhancer */}
                  {showAIHelper && (
                    <AIMessageEnhancer
                      message={formData.action.config.message || ''}
                      messageType={formData.multiChannel.primaryChannel}
                      triggerType={formData.trigger.type}
                      onMessageUpdate={(newMessage) => updateFormData('action.config.message', newMessage)}
                    />
                  )}
                </div>
                {/* Delay settings */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Timing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Send timing</Label>
                      <Select 
                        value={formData.action.delay?.type || 'immediate'} 
                        onValueChange={(value) => updateFormData('action.delay.type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Send immediately</SelectItem>
                          <SelectItem value="minutes">Wait X minutes</SelectItem>
                          <SelectItem value="hours">Wait X hours</SelectItem>
                          <SelectItem value="days">Wait X days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.action.delay?.type !== 'immediate' && (
                      <div className="space-y-2">
                        <Label>Delay amount</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.action.delay?.value || 1}
                          onChange={(e) => updateFormData('action.delay.value', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Step 5: Delivery Window */}
      {currentStep === 5 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle icon={Clock}>
              When to send (Delivery Window)
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.deliveryWindow.businessHoursOnly}
                  onCheckedChange={(checked) => updateFormData('deliveryWindow.businessHoursOnly', checked)}
                />
                <Label>Only send during business hours</Label>
              </div>
              
              {formData.deliveryWindow.businessHoursOnly && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label>Start time</Label>
                    <Input
                      type="time"
                      value={formData.deliveryWindow.timeRange?.start || '09:00'}
                      onChange={(e) => updateFormData('deliveryWindow.timeRange.start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End time</Label>
                    <Input
                      type="time"
                      value={formData.deliveryWindow.timeRange?.end || '17:00'}
                      onChange={(e) => updateFormData('deliveryWindow.timeRange.end', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Days of the week</Label>
                <div className="flex gap-2">
                  {[
                    { key: 'mon', label: 'Mon' },
                    { key: 'tue', label: 'Tue' },
                    { key: 'wed', label: 'Wed' },
                    { key: 'thu', label: 'Thu' },
                    { key: 'fri', label: 'Fri' },
                    { key: 'sat', label: 'Sat' },
                    { key: 'sun', label: 'Sun' }
                  ].map((day) => (
                    <Button
                      key={day.key}
                      variant={formData.deliveryWindow.allowedDays.includes(day.key) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const currentDays = formData.deliveryWindow.allowedDays;
                        const newDays = currentDays.includes(day.key)
                          ? currentDays.filter(d => d !== day.key)
                          : [...currentDays, day.key];
                        updateFormData('deliveryWindow.allowedDays', newDays);
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Summary */}
      {currentStep === 5 && validateStep(5) && (
        <ModernCard variant="elevated" className="border-green-200 bg-green-50">
          <ModernCardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Automation Summary</span>
            </div>
            <div className="text-sm text-green-600">
              <p><strong>When:</strong> {triggerTypes.find(t => t.value === formData.trigger.type)?.label}</p>
              <p><strong>Action:</strong> {actionTypes.find(a => a.value === formData.action.type)?.label}</p>
              <p><strong>Channel:</strong> {formData.multiChannel.primaryChannel.toUpperCase()}{formData.multiChannel.fallbackEnabled && ` → ${formData.multiChannel.fallbackChannel?.toUpperCase()}`}</p>
              {formData.conditions?.rules && formData.conditions.rules.length > 0 && (
                <p><strong>Conditions:</strong> {formData.conditions.rules.length} condition(s) with {formData.conditions.operator} logic</p>
              )}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel()}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!validateStep(currentStep)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <GradientButton
              variant="primary"
              onClick={handleSave}
              disabled={!validateStep(5)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Automation
            </GradientButton>
          )}
        </div>
      </div>
    </div>
  );
};