import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, AlertCircle, RefreshCw, Shield, Lock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { useRBAC } from '@/components/auth/RBACProvider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

type EmailVisibilityMode = 'admin_only' | 'role_based' | 'all_members';

interface OrganizationEmailSettings {
  organization_email_address: string | null;
  email_visibility_mode: EmailVisibilityMode;
  default_from_name: string | null;
}

export default function CompanyEmailSettings() {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { hasPermission, hasRole } = useRBAC();

  const [settings, setSettings] = useState<OrganizationEmailSettings>({
    organization_email_address: null,
    email_visibility_mode: 'role_based',
    default_from_name: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Check if user has permission to manage email settings
  const canManageSettings = hasPermission('emails.settings.manage') || hasRole('admin');

  useEffect(() => {
    if (organization?.id) {
      loadEmailSettings();
    }
  }, [organization?.id]);

  const loadEmailSettings = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);

      // Load from organization_communication_settings
      const { data, error: fetchError } = await supabase
        .from('organization_communication_settings')
        .select('organization_email_address, email_visibility_mode, default_from_name')
        .eq('organization_id', organization.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's ok for first time
        console.error('Error loading email settings:', fetchError);
      }

      if (data) {
        setSettings({
          organization_email_address: data.organization_email_address,
          email_visibility_mode: (data.email_visibility_mode as EmailVisibilityMode) || 'role_based',
          default_from_name: data.default_from_name
        });
      }
    } catch (err) {
      console.error('Error loading organization email settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateEmailAddress = async () => {
    if (!organization?.id || !canManageSettings) return;

    setGenerating(true);
    setError('');

    try {
      // Generate email based on organization name
      const sanitizedName = organization.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 30) || `org${organization.id.substring(0, 8)}`;

      // Check for uniqueness
      const emailPrefix = sanitizedName;
      let counter = 0;
      let isUnique = false;

      while (!isUnique) {
        const testEmail = counter === 0 ? `${emailPrefix}@fixlify.app` : `${emailPrefix}${counter}@fixlify.app`;

        const { data: existing } = await supabase
          .from('organization_communication_settings')
          .select('organization_id')
          .eq('organization_email_address', testEmail)
          .neq('organization_id', organization.id)
          .single();

        if (!existing) {
          setSettings(prev => ({
            ...prev,
            organization_email_address: testEmail
          }));
          isUnique = true;
        } else {
          counter++;
        }

        // Safety limit
        if (counter > 100) {
          throw new Error('Could not generate unique email');
        }
      }
    } catch (err) {
      setError('Failed to generate email address');
      console.error('Error generating email:', err);
    } finally {
      setGenerating(false);
    }
  };

  const saveSettings = async () => {
    if (!organization?.id || !canManageSettings) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Upsert to organization_communication_settings
      const { error: saveError } = await supabase
        .from('organization_communication_settings')
        .upsert({
          organization_id: organization.id,
          organization_email_address: settings.organization_email_address,
          email_visibility_mode: settings.email_visibility_mode,
          default_from_name: settings.default_from_name || organization.name,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (saveError) throw saveError;

      setSuccess('Email settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving email settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (settings.organization_email_address) {
      navigator.clipboard.writeText(settings.organization_email_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || orgLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // No permission - show read-only view
  if (!canManageSettings) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lock className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                Email settings can only be modified by administrators.
              </p>
              {settings.organization_email_address && (
                <div className="mt-3 flex items-center bg-white rounded-md px-3 py-2">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{settings.organization_email_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Email Address</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your organization's unique email address for receiving client emails. All team members with email access will see these emails based on visibility settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Address Section */}
        {!settings.organization_email_address ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  No organization email address set up. Generate one to start receiving emails from clients.
                </p>
                <button
                  onClick={generateEmailAddress}
                  disabled={generating}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-1" />
                      Generate Email Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">{settings.organization_email_address}</span>
                <Badge variant="outline" className="ml-2 text-xs">Organization</Badge>
              </div>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <button
              onClick={generateEmailAddress}
              disabled={generating || saving}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
              Generate New
            </button>
          </div>
        )}

        {/* Email Visibility Settings */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-indigo-600 mr-2" />
            <h4 className="text-sm font-medium text-gray-900">Email Visibility</h4>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Control who in your organization can view incoming emails
          </p>

          <RadioGroup
            value={settings.email_visibility_mode}
            onValueChange={(value: EmailVisibilityMode) =>
              setSettings(prev => ({ ...prev, email_visibility_mode: value }))
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="admin_only" id="admin_only" className="mt-0.5" />
              <Label htmlFor="admin_only" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Admin Only</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Only administrators can view all emails
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="role_based" id="role_based" className="mt-0.5" />
              <Label htmlFor="role_based" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Role-Based</span>
                  <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Team members see emails based on their role permissions (assigned clients/jobs)
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="all_members" id="all_members" className="mt-0.5" />
              <Label htmlFor="all_members" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">All Members</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  All organization members can view all emails
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Clients can send emails to your organization email address</li>
            <li>• Emails automatically appear in your Connect Center</li>
            <li>• Team members see emails based on visibility settings</li>
            <li>• All conversations are tracked and organized by client</li>
            <li>• Emails can be assigned to specific team members</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
