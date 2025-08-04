
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Info } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { generateFromEmail } from '@/utils/emailUtils';

export const EmailConfiguration = () => {
  const { companySettings: settings } = useCompanySettings();

  const getEmailAddress = () => {
    return generateFromEmail(settings.company_name || 'Fixlify Services');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </h3>
        <p className="text-muted-foreground">
          Your email system is configured and ready to use with Mailgun
        </p>
      </div>

      {/* Current Email Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Email Domain Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Email System Active</h4>
                <p className="text-sm text-green-700 mt-1">
                  Sending emails from: <strong>{getEmailAddress()}</strong>
                </p>
                <p className="text-sm text-green-700">
                  Domain: <strong>fixlify.app</strong> (verified)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Automatic Email Generation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your email address is automatically generated from your company name. 
                  To change it, update your company name in the Company Information section above.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Example:</strong> "Fixlify AI" becomes <strong>fixlify_ai@fixlify.app</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current Email Address</div>
              <div className="text-sm text-muted-foreground">
                Emails will be sent from this address
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {getEmailAddress()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Email configuration is managed automatically. Your emails will be sent from the address shown above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
