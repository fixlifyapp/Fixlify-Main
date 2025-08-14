import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TelnyxAIConfigurationProps {
  phoneNumberId: string;
  phoneNumber: string;
}

export default function TelnyxAIConfiguration({ phoneNumberId, phoneNumber }: TelnyxAIConfigurationProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [config, setConfig] = useState({
    agent_name: '',
    company_name: '',
    hours_of_operation: '',
    services_offered: '',
    greeting_message: '',
    agent_personality: '',
    call_transfer_message: '',
    voicemail_detection_message: ''
  });

  useEffect(() => {
    loadConfiguration();
  }, [phoneNumberId]);