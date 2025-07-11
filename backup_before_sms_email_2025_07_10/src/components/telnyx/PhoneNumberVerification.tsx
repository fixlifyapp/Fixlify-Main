
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Phone, Search, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function PhoneNumberVerification() {
  const [isChecking, setIsChecking] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const checkPhoneNumberAssignment = async () => {
    setIsChecking(true);
    try {
      console.log('Checking phone number assignment...');
      
      const { data, error } = await supabase.functions.invoke('check-telnyx-db', {
        body: {}
      });

      if (error) {
        console.error('Error checking phone number:', error);
        throw error;
      }

      console.log('Phone number check result:', data);
      setVerificationResult(data);
      
      if (data.success) {
        toast.success('Phone number verification completed');
      } else {
        toast.error('Failed to verify phone number assignment');
      }
    } catch (error) {
      console.error('Failed to check phone number assignment:', error);
      toast.error(`Failed to check phone number: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const assignPhoneNumber = async () => {
    try {
      console.log('Claiming phone number +14375249932...');
      
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'claim_existing',
          phone_number: '+14375249932'
        }
      });

      if (error) {
        console.error('Error claiming phone number:', error);
        throw error;
      }

      if (data.success) {
        toast.success('Phone number successfully assigned to your account!');
        // Refresh the verification
        setTimeout(() => {
          checkPhoneNumberAssignment();
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to assign phone number');
      }
    } catch (error) {
      console.error('Failed to assign phone number:', error);
      toast.error(`Failed to assign phone number: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Number Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={checkPhoneNumberAssignment}
            disabled={isChecking}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            {isChecking ? 'Checking...' : 'Verify Phone Number Assignment'}
          </Button>
        </div>

        {verificationResult && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Verification Results for +14375249932</h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Telnyx Table:</span>
                  {verificationResult.telnyx_table.exists ? (
                    <Badge variant="default" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Found
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Found
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Regular Table:</span>
                  {verificationResult.regular_table.exists ? (
                    <Badge variant="default" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Found
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Found
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your Numbers:</span>
                  <Badge variant="outline">
                    Telnyx: {verificationResult.user_numbers.telnyx_count}
                  </Badge>
                  <Badge variant="outline">
                    Regular: {verificationResult.user_numbers.regular_count}
                  </Badge>
                </div>
              </div>

              {verificationResult.recommendations && verificationResult.recommendations.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="text-sm space-y-1">
                    {verificationResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show assign button if number is not found or not assigned to current user */}
              {(!verificationResult.telnyx_table.exists || 
                (verificationResult.telnyx_table.exists && 
                 verificationResult.telnyx_table.data.length > 0 && 
                 verificationResult.authenticated_user && 
                 verificationResult.telnyx_table.data[0].user_id !== verificationResult.authenticated_user)) && (
                <div className="mt-4">
                  <Button
                    onClick={assignPhoneNumber}
                    className="flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign +14375249932 to My Account
                  </Button>
                </div>
              )}
            </div>

            {/* Show detailed data if available */}
            {(verificationResult.telnyx_table.data.length > 0 || verificationResult.regular_table.data.length > 0) && (
              <details className="bg-gray-50 p-3 rounded-lg">
                <summary className="cursor-pointer font-medium">View Raw Data</summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(verificationResult, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h5 className="font-medium text-yellow-800 mb-2">📞 About +14375249932</h5>
          <p className="text-sm text-yellow-700">
            This is your company's existing Telnyx phone number. If it's not properly assigned to your account, 
            use the verification tool above to check and assign it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
