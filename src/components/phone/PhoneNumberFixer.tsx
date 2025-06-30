
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Phone, User, CheckCircle } from 'lucide-react';

export const PhoneNumberFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleFixAssignments = async () => {
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-phone-assignments', {
        body: {}
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Successfully assigned ${data.numbers?.length || 0} phone numbers to your account`);
        setIsFixed(true);
      } else {
        toast.error(data?.error || 'Failed to fix phone assignments');
      }
    } catch (error) {
      console.error('Error fixing phone assignments:', error);
      toast.error('Failed to fix phone assignments');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Phone Number Assignment Fix
        </CardTitle>
        <CardDescription>
          Fix phone number assignments for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will assign any unassigned phone numbers to your account and activate them for sending SMS messages.
          </p>
          
          {isFixed ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Phone numbers have been assigned successfully!
            </div>
          ) : (
            <Button 
              onClick={handleFixAssignments}
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {isFixing ? 'Fixing Assignments...' : 'Fix Phone Assignments'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
