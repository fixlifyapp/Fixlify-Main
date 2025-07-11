import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Phone, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneNumber {
  id?: string;
  phone_number: string;
  status: string;
  user_id?: string;
  area_code?: string;
  locality?: string;
  region?: string;
  country_code?: string;
  features?: string[];
  connection_id?: string;
  messaging_profile_id?: string;
  created_at?: string;
  purchased_at?: string;
}

export function TelnyxPhoneSync() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [telnyxConnected, setTelnyxConnected] = useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Проверка подключения к Telnyx
  const checkTelnyxConnection = async () => {    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'test_telnyx_connection' }
      });

      if (error) throw error;
      
      setTelnyxConnected(data?.success || false);
      return data?.success || false;
    } catch (error) {
      console.error('Error checking Telnyx connection:', error);
      setTelnyxConnected(false);
      return false;
    }
  };

  // Загрузка номеров из базы данных
  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .order('phone_number');
      
      if (error) throw error;
      setNumbers(data || []);
    } catch (error) {
      console.error('Error fetching numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };
  // Синхронизация с Telnyx API
  const syncWithTelnyx = async () => {
    setSyncing(true);
    toast.info('Syncing with Telnyx...');
    
    try {
      // Сначала получаем номера из Telnyx
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list_available_from_telnyx' }
      });

      if (error) throw error;

      if (data?.success) {
        const telnyxNumbers = data.available_numbers || [];
        
        // Для каждого номера из Telnyx проверяем и обновляем в базе
        for (const telnyxNum of telnyxNumbers) {
          // Проверяем, есть ли номер в базе
          const { data: existingNumber } = await supabase
            .from('telnyx_phone_numbers')
            .select('*')
            .eq('phone_number', telnyxNum.phone_number)
            .single();

          if (!existingNumber) {
            // Добавляем новый номер
            await supabase
              .from('telnyx_phone_numbers')
              .insert({
                phone_number: telnyxNum.phone_number,
                status: 'available',                country_code: telnyxNum.country_code || 'US',
                area_code: telnyxNum.area_code,
                locality: telnyxNum.locality,
                region: telnyxNum.region,
                connection_id: telnyxNum.connection_id,
                messaging_profile_id: telnyxNum.messaging_profile_id,
                features: telnyxNum.features || ['sms', 'voice', 'mms'],
                monthly_cost: telnyxNum.monthly_cost || 0,
                setup_cost: telnyxNum.setup_cost || 0,
                purchased_at: telnyxNum.purchased_at || new Date().toISOString()
              });
          }
        }

        setLastSyncTime(new Date());
        toast.success(`Synced ${telnyxNumbers.length} numbers from Telnyx`);
        
        // Обновляем список
        await fetchNumbers();
      } else {
        toast.warning('No numbers found in Telnyx account');
      }
    } catch (error) {
      console.error('Error syncing with Telnyx:', error);
      toast.error('Failed to sync with Telnyx');
    } finally {
      setSyncing(false);
    }
  };

  // Автоматическая синхронизация при загрузке
  useEffect(() => {    const init = async () => {
      await fetchNumbers();
      const isConnected = await checkTelnyxConnection();
      
      // Автоматическая синхронизация при загрузке, если включена
      if (autoSyncEnabled && isConnected) {
        await syncWithTelnyx();
      }
    };
    
    init();
  }, []);

  // Периодическая синхронизация (каждые 5 минут)
  useEffect(() => {
    if (!autoSyncEnabled || !telnyxConnected) return;

    const interval = setInterval(() => {
      syncWithTelnyx();
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [autoSyncEnabled, telnyxConnected]);

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (    <div className="space-y-6">
      {/* Статус подключения */}
      <Alert className={telnyxConnected ? 'border-green-500' : 'border-yellow-500'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {telnyxConnected === null ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : telnyxConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <AlertTitle>
              {telnyxConnected === null 
                ? 'Checking Telnyx Connection...'
                : telnyxConnected 
                ? 'Connected to Telnyx'
                : 'Telnyx Not Connected'}
            </AlertTitle>
          </div>
          {lastSyncTime && (
            <span className="text-sm text-muted-foreground">
              Last sync: {formatDate(lastSyncTime)}
            </span>
          )}
        </div>
        <AlertDescription className="mt-2">
          {telnyxConnected 
            ? 'Your phone numbers will automatically sync from your Telnyx account.'
            : 'Configure your Telnyx API key to enable automatic syncing.'}
        </AlertDescription>
      </Alert>
      {/* Управление синхронизацией */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Number Synchronization</CardTitle>
          <CardDescription>
            Automatically sync phone numbers from your Telnyx account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={syncWithTelnyx}
                disabled={syncing || !telnyxConnected}
                variant="default"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSync"                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="autoSync" className="text-sm font-medium">
                  Auto-sync every 5 minutes
                </label>
              </div>
            </div>
            
            <Badge variant="secondary">
              <Phone className="mr-1 h-3 w-3" />
              {numbers.length} numbers
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Список номеров */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Available Phone Numbers</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchNumbers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>        <CardContent>
          {loading && numbers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : numbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No phone numbers found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Sync Now" to import numbers from Telnyx
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {numbers.map((number) => (
                <div
                  key={number.phone_number}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{number.phone_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                          {number.status}
                        </Badge>
                        {number.area_code && (
                          <span className="text-sm text-muted-foreground">
                            Area: {number.area_code}                          </span>
                        )}
                        {number.locality && (
                          <span className="text-sm text-muted-foreground">
                            • {number.locality}
                          </span>
                        )}
                        {number.region && (
                          <span className="text-sm text-muted-foreground">
                            • {number.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {number.connection_id && (
                      <Badge variant="outline">
                        <Wifi className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {number.user_id ? (
                      <Badge variant="default">Claimed</Badge>
                    ) : (
                      <Badge variant="secondary">Available</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}