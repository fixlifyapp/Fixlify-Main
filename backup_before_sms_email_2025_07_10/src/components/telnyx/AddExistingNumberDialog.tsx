
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Phone } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPhoneForTelnyx } from '@/utils/phoneUtils';

export function AddExistingNumberDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const queryClient = useQueryClient();

  const addNumberMutation = useMutation({
    mutationFn: async (number: string) => {
      const formattedNumber = formatPhoneForTelnyx(number);
      console.log('Adding existing number:', formattedNumber);
      
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'add_existing',
          phone_number: formattedNumber,
          country_code: 'US'
        }
      });

      if (error) {
        console.error('Add existing number error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully added existing number:', data);
      toast.success(`Number ${data.phone_number} added successfully!`);
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      setIsOpen(false);
      setPhoneNumber('');
    },
    onError: (error) => {
      console.error('Add existing number error:', error);
      toast.error(`Failed to add number: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    addNumberMutation.mutate(phoneNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Existing Number
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Add Your Telnyx Number
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+14375249932 or 4375249932"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={addNumberMutation.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Enter your Telnyx phone number (with or without country code)
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-1">📋 Instructions</h5>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Enter your Telnyx phone number above</li>
              <li>2. Click "Add Number" to connect it to your account</li>
              <li>3. Configure AI dispatcher for automated call handling</li>
            </ol>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={addNumberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addNumberMutation.isPending}
            >
              {addNumberMutation.isPending ? 'Adding...' : 'Add Number'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
