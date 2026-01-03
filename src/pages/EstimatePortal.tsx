import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import {
  DocumentHeader,
  DocumentItemsTable,
  DocumentTotals,
  DocumentNotes,
} from '@/components/documents/DocumentComponents';
import { PortalThemeProvider, usePortalTheme } from '@/components/portal/PortalThemeProvider';
import { PortalActionBar } from '@/components/portal/PortalActionBar';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import { PortalErrorState } from '@/components/portal/PortalErrorState';
import { cn } from '@/lib/utils';

interface EstimateData {
  id: string;
  estimate_number: string;
  status: string;
  description?: string;
  notes?: string;
  terms?: string;
  created_at: string;
  valid_until?: string;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total?: number;
  subtotal?: number;
  job_id?: string;
  client_id?: string;
  contact_role?: 'owner' | 'tenant' | 'property_manager' | 'emergency_contact';
}

interface JobData {
  id: string;
  title: string;
  description?: string;
  property_id?: string;
}

interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface PropertyData {
  id: string;
  property_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
}

interface CompanyData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  logo?: string;
}

interface LineItem {
  id: string;
  name?: string;
  description?: string;
  quantity?: string | number;
  rate?: string | number;
  price?: string | number;
  amount?: string | number;
  total?: string | number;
}

function EstimatePortalContent() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const { toast } = useToast();
  const { isDark } = usePortalTheme();

  const loadEstimateData = useCallback(async () => {
    if (!token) {
      setError('Invalid access link. Please check your URL and try again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load estimate by portal access token
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('portal_access_token', token)
        .maybeSingle();

      if (estimateError) {
        console.error('Estimate fetch error:', estimateError);
        throw new Error('Unable to load estimate. Please try again.');
      }

      if (!estimateData) {
        setError('This estimate could not be found or the link has expired.');
        setLoading(false);
        return;
      }

      setEstimate(estimateData);

      // Load related data in parallel for better performance
      const promises: Promise<void>[] = [];

      // Load job if exists
      if (estimateData.job_id) {
        promises.push(
          supabase
            .from('jobs')
            .select('id, title, description, property_id')
            .eq('id', estimateData.job_id)
            .maybeSingle()
            .then(({ data: jobData }) => {
              if (jobData) {
                setJob(jobData);
                // Load property if job has one
                if (jobData.property_id) {
                  return supabase
                    .from('client_properties')
                    .select('id, property_name, address, city, state, zip, property_type')
                    .eq('id', jobData.property_id)
                    .maybeSingle()
                    .then(({ data: propertyData }) => {
                      if (propertyData) setProperty(propertyData);
                    });
                }
              }
            })
        );
      }

      // Load client if exists
      if (estimateData.client_id) {
        promises.push(
          supabase
            .from('clients')
            .select('id, name, email, phone, company, address, city, state, zip')
            .eq('id', estimateData.client_id)
            .maybeSingle()
            .then(({ data: clientData }) => {
              if (clientData) setClient(clientData);
            })
        );
      }

      // Load line items
      promises.push(
        supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', estimateData.id)
          .order('created_at', { ascending: true })
          .then(({ data: lineItemsData }) => {
            if (lineItemsData) setLineItems(lineItemsData);
          })
      );

      // Load company settings
      promises.push(
        supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .maybeSingle()
          .then(({ data: companyData }) => {
            if (companyData) {
              setCompany({
                name: companyData.company_name,
                email: companyData.company_email,
                phone: companyData.company_phone,
                website: companyData.company_website,
                address: companyData.company_address,
                city: companyData.company_city,
                state: companyData.company_state,
                zip: companyData.company_zip,
                logo: companyData.company_logo_url,
              });
            }
          })
      );

      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading estimate:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load estimate. Please try again.'
      );
      toast.error('Failed to load estimate. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    loadEstimateData();
  }, [loadEstimateData]);

  const handleAccept = useCallback(() => {
    toast.info(
      'Online estimate acceptance will be available soon. Please contact us to accept this estimate.'
    );
    // TODO: Implement online acceptance flow
  }, [toast]);

  // Loading state
  if (loading) {
    return <PortalLoadingSkeleton documentType="estimate" />;
  }

  // Error state
  if (error || !estimate) {
    return (
      <PortalErrorState
        type={!estimate ? 'not_found' : 'generic'}
        message={error || undefined}
        onRetry={loadEstimateData}
        supportEmail={company?.email}
      />
    );
  }

  // Calculate totals
  const productItems = lineItems.filter(
    (item) =>
      !item.name?.toLowerCase().includes('tax') &&
      !item.description?.toLowerCase().includes('tax')
  );

  const subtotal = productItems.reduce((sum, item) => {
    const amount = parseFloat(String(item.total || item.amount || '0'));
    return sum + amount;
  }, 0);

  const taxRate = estimate.tax_rate || 0;
  const taxAmount = estimate.tax_amount || (subtotal * taxRate) / 100;
  const discountAmount = estimate.discount_amount || 0;
  const total = estimate.total || subtotal + taxAmount - discountAmount;

  // Check if estimate can be accepted
  const canAccept =
    estimate.status !== 'accepted' &&
    estimate.status !== 'declined' &&
    estimate.status !== 'expired';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Action Bar */}
      <PortalActionBar
        documentType="estimate"
        documentNumber={estimate.estimate_number}
        status={estimate.status}
        companyName={company?.name}
        onPrimaryAction={canAccept ? handleAccept : undefined}
        primaryActionLabel="Accept Estimate"
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
            {/* Header with Company and Client Info */}
            <DocumentHeader
              type="estimate"
              documentNumber={estimate.estimate_number}
              date={estimate.created_at}
              validUntil={estimate.valid_until}
              status={estimate.status}
              company={company || undefined}
              client={client || undefined}
              property={
                property
                  ? {
                      name: property.property_name,
                      address: property.address,
                      city: property.city,
                      state: property.state,
                      zip: property.zip,
                      type: property.property_type,
                    }
                  : undefined
              }
              contactRole={estimate.contact_role}
            />

            {/* Job Information */}
            {job && (
              <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job Reference
                    </h3>
                    <p className="mt-1 text-base sm:text-lg text-gray-900 dark:text-white">
                      {job.title}
                    </p>
                  </div>
                  {estimate.valid_until && (
                    <div className="text-left sm:text-right">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Valid Until
                      </h3>
                      <p className="mt-1 text-base sm:text-lg text-gray-900 dark:text-white">
                        {new Date(estimate.valid_until).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {estimate.description && (
              <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                  Description
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {estimate.description}
                </p>
              </div>
            )}

            {/* Line Items */}
            {productItems.length > 0 && (
              <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
                  Items
                </h3>
                <DocumentItemsTable items={productItems} />
              </div>
            )}

            {/* Totals and Notes */}
            <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Notes */}
                <div className="order-2 lg:order-1">
                  {estimate.notes && (
                    <DocumentNotes
                      title="Notes"
                      content={estimate.notes}
                      type="info"
                    />
                  )}
                  {estimate.terms && (
                    <DocumentNotes
                      title="Terms & Conditions"
                      content={estimate.terms}
                      type="warning"
                    />
                  )}
                </div>

                {/* Totals */}
                <div className="order-1 lg:order-2">
                  <DocumentTotals
                    subtotal={subtotal}
                    taxAmount={taxAmount}
                    taxRate={taxRate}
                    discountAmount={discountAmount}
                    total={total}
                  />
                </div>
              </div>
            </div>

            {/* Mobile CTA - Sticky at bottom on mobile */}
            {canAccept && (
              <div className="sm:hidden sticky bottom-0 px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
                <button
                  onClick={handleAccept}
                  className={cn(
                    'w-full py-3 px-4 rounded-lg font-semibold text-white',
                    'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
                    'transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                    'dark:focus:ring-offset-gray-900'
                  )}
                >
                  Accept Estimate - ${total.toFixed(2)}
                </button>
              </div>
            )}

            {/* Footer */}
            <div
              className={cn(
                'px-6 sm:px-8 py-6 text-white text-center',
                'bg-gradient-to-r from-purple-600 to-purple-700'
              )}
            >
              <p className="text-sm sm:text-base">
                Thank you for considering our services. We look forward to working
                with you!
              </p>
              {company?.email && (
                <p className="text-sm mt-2 opacity-90">
                  Questions? Contact us at{' '}
                  <a
                    href={`mailto:${company.email}`}
                    className="underline hover:no-underline"
                  >
                    {company.email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* QR Code Section - Desktop only */}
          <div className="mt-6 hidden sm:flex justify-center print:hidden">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Scan to view on mobile
              </p>
              <div className="bg-white p-3 inline-block rounded-lg">
                <QRCode
                  value={window.location.href}
                  size={100}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
          </div>

          {/* Powered by footer */}
          <div className="mt-6 text-center print:hidden">
            <p className="text-sm text-gray-400 dark:text-gray-600">
              Powered by{' '}
              <span className="font-medium text-purple-600 dark:text-purple-400">
                Fixlify
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrapper component with theme provider
export default function EstimatePortal() {
  return (
    <PortalThemeProvider>
      <EstimatePortalContent />
    </PortalThemeProvider>
  );
}
