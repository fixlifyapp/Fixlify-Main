
import React from 'react';
import { TelnyxPhoneSync } from '@/components/phone/TelnyxPhoneSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManualPhoneNumberAdd } from '@/components/phone/ManualPhoneNumberAdd';
import { PhoneNumberFixer } from '@/components/phone/PhoneNumberFixer';

export default function PhoneManagementPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Phone Number Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage and sync your phone numbers from Telnyx
      </p>

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
    </div>
  );
}
