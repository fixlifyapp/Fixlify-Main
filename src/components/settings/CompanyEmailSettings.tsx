import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { generateUniqueCompanyEmail } from '@/utils/company-email';

export default function CompanyEmailSettings() {
  const { user } = useAuth();
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadCompanyEmail();
  }, [user]);

  const loadCompanyEmail = async () => {
    if (!user) return;

    try {
      // Check company_settings first
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('company_email_address, company_name')
        .eq('user_id', user.id)
        .single();

      if (companySettings?.company_email_address) {
        setCompanyEmail(companySettings.company_email_address);
      } else {
        // Check profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_email_address, company_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.company_email_address) {
          setCompanyEmail(profile.company_email_address);
        }
      }
    } catch (err) {
      console.error('Error loading company email:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async () => {
    if (!user) return;
    
    setGenerating(true);
    setError('');

    try {
      // Get company name
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('company_name')
        .eq('user_id', user.id)
        .single();

      const companyName = companySettings?.company_name || 'Company';
      
      // Generate unique email
      const newEmail = await generateUniqueCompanyEmail(supabase, companyName);
      setCompanyEmail(newEmail);
    } catch (err) {
      setError('Failed to generate email address');
      console.error('Error generating email:', err);
    } finally {
      setGenerating(false);
    }
  };

  const saveCompanyEmail = async () => {
    if (!user || !companyEmail) return;

    setSaving(true);
    setError('');

    try {
      // Update company_settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ company_email_address: companyEmail })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Also update profiles
      await supabase
        .from('profiles')
        .update({ company_email_address: companyEmail })
        .eq('user_id', user.id);

      // Show success
      setCopied(false);
    } catch (err) {
      setError('Failed to save email address');
      console.error('Error saving company email:', err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(companyEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Company Email Address</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your unique email address for receiving client emails. All emails sent to this address will appear in your Connect Center.
        </p>
      </div>

      <div className="space-y-4">
        {!companyEmail ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  No company email address set up. Generate one to start receiving emails from clients.
                </p>
                <button
                  onClick={generateEmail}
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
                <span className="text-sm font-medium text-gray-900">{companyEmail}</span>
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

            <div className="flex items-center space-x-3">
              <button
                onClick={generateEmail}
                disabled={generating || saving}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
                Generate New
              </button>
              
              <button
                onClick={saveCompanyEmail}
                disabled={saving}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Clients can send emails to your company email address</li>
            <li>• Emails automatically appear in your Connect Center</li>
            <li>• Reply directly from the Connect Center using this address</li>
            <li>• All conversations are tracked and organized by client</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
