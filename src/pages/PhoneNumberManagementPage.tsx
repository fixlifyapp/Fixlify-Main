import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Plus, 
  Settings, 
  Trash2, 
  Star,
  MessageSquare,
  PhoneCall,
  Bot,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPhoneNumber } from '@/utils/phone-utils';
import { PhoneNumberPurchase } from '@/components/connect/PhoneNumberPurchase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  status: string;
  is_primary: boolean;
  is_active: boolean;
  capabilities?: {
    sms: boolean;
    voice: boolean;
    mms: boolean;
  };
  ai_dispatcher_enabled?: boolean;
  purchased_at?: string;
  locality?: string;
  region?: string;
}

export default function PhoneNumberManagementPage() {
  const { user } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingNumber, setIsDeletingNumber] = useState(false);
  const [activeTab, setActiveTab] = useState('my-numbers');

  useEffect(() => {
    fetchPhoneNumbers();
  }, [user]);

  const fetchPhoneNumbers = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'purchased')
        .order('is_primary', { ascending: false })
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };
