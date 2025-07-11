import React from 'react';
// import { TelnyxPhoneSync } from '@/components/phone/TelnyxPhoneSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ManualPhoneNumberAdd } from '@/components/phone/ManualPhoneNumberAdd';
// import { PhoneNumberFixer } from '@/components/phone/PhoneNumberFixer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone } from 'lucide-react';

export default function PhoneManagementPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Phone Number Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage and sync your phone numbers from Telnyx
      </p>

      <Alert className="mb-6">
        <Phone className="h-4 w-4" />
        <AlertDescription>
          Phone number management is currently being updated. Please use the SQL script to add your phone numbers for now.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Add Phone Number via SQL</CardTitle>
          <CardDescription>
            Run this SQL in Supabase to add your Telnyx phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`INSERT INTO phone_numbers (user_id, phone_number, is_primary, is_active)
VALUES (
  auth.uid(),
  '+14375249932',  -- Your Telnyx number
  true,
  true
)
ON CONFLICT (phone_number) 
DO UPDATE SET 
  user_id = auth.uid(),
  is_primary = true,
  is_active = true;`}
          </pre>
        </CardContent>
      </Card>

      {/* Original tabs commented out until components are available
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Auto Sync</TabsTrigger>
          <TabsTrigger value="manual">Manual Add</TabsTrigger>
          <TabsTrigger value="fix">Fix Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4">
          <TelnyxPhoneSync />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualPhoneNumberAdd />
        </TabsContent>

        <TabsContent value="fix" className="space-y-4">
          <PhoneNumberFixer />
        </TabsContent>
      </Tabs>
      */}
    </div>
  );
}
