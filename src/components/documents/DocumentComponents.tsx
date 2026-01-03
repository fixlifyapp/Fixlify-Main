import React from 'react';
import { format } from 'date-fns';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Hash,
  Home,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentHeaderProps {
  type: 'estimate' | 'invoice';
  documentNumber: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  status?: string;
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    logo?: string;
  };
  client?: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  property?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    type?: string;
  };
  contactRole?: 'owner' | 'tenant' | 'property_manager' | 'emergency_contact';
}

const CONTACT_ROLE_LABELS: Record<string, { label: string; description: string }> = {
  owner: { label: 'Property Owner', description: 'Owner of record' },
  tenant: { label: 'Tenant', description: 'Current tenant' },
  property_manager: { label: 'Property Manager', description: 'Managing agent' },
  emergency_contact: { label: 'Emergency Contact', description: 'Emergency contact' },
};

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  type,
  documentNumber,
  date,
  dueDate,
  validUntil,
  status,
  company,
  client,
  property,
  contactRole,
}) => {
  const isEstimate = type === 'estimate';
  const gradientFrom = isEstimate ? 'from-purple-600' : 'from-green-600';
  const gradientTo = isEstimate ? 'to-purple-700' : 'to-green-700';
  const roleInfo = contactRole ? CONTACT_ROLE_LABELS[contactRole] : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-sm">
      {/* Header Bar */}
      <div className={cn('bg-gradient-to-r p-6 sm:p-8 rounded-t-2xl', gradientFrom, gradientTo)}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {isEstimate ? 'ESTIMATE' : 'INVOICE'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="text-base sm:text-lg font-medium">{documentNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="text-base sm:text-lg">
                  {format(new Date(date), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name || 'Company logo'}
                className="h-12 sm:h-16 object-contain"
              />
            ) : (
              <div className="bg-white/20 backdrop-blur rounded-xl p-3 sm:p-4">
                <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" aria-hidden="true" />
              </div>
            )}
            {status && (
              <span
                className={cn(
                  'inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium',
                  status === 'paid' || status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : status === 'sent' || status === 'viewed'
                      ? 'bg-blue-100 text-blue-800'
                      : status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : status === 'expired' || status === 'declined'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                )}
              >
                {status.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
        {/* From (Company) */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
            From
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {company?.name || 'Your Company'}
            </h4>

            {company?.address && (
              <div className="flex items-start gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm sm:text-base">
                  <p>{company.address}</p>
                  {(company.city || company.state || company.zip) && (
                    <p>
                      {company.city}
                      {company.city && company.state ? ', ' : ''}
                      {company.state} {company.zip}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              {company?.phone && (
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${company.phone}`}
                    className="text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {company.phone}
                  </a>
                </div>
              )}

              {company?.email && (
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                  >
                    {company.email}
                  </a>
                </div>
              )}

              {company?.website && (
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* To (Client) */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
            {isEstimate ? 'To' : 'Bill To'}
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {client?.name || 'Client Name'}
                </h4>
                {roleInfo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {roleInfo.label}
                  </span>
                )}
              </div>
              {client?.company && (
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {client.company}
                </p>
              )}
            </div>

            {client?.address && (
              <div className="flex items-start gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm sm:text-base">
                  <p>{client.address}</p>
                  {(client.city || client.state || client.zip) && (
                    <p>
                      {client.city}
                      {client.city && client.state ? ', ' : ''}
                      {client.state} {client.zip}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              {client?.phone && (
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${client.phone}`}
                    className="text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {client.phone}
                  </a>
                </div>
              )}

              {client?.email && (
                <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                  >
                    {client.email}
                  </a>
                </div>
              )}
            </div>

            {/* Due Date / Valid Until */}
            {(dueDate || validUntil) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">
                    {isEstimate ? 'Valid Until:' : 'Due Date:'}
                  </span>{' '}
                  {format(new Date(dueDate || validUntil!), 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Information (for landlord/tenant scenarios) */}
      {property && (property.name || property.address) && (
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-gray-100 dark:border-gray-800 pt-4 sm:pt-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Home className="h-4 w-4" aria-hidden="true" />
            Service Location
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {property.name && (
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {property.name}
                  </p>
                )}
                {property.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {property.address}
                    {(property.city || property.state || property.zip) && (
                      <>
                        <br />
                        {property.city}
                        {property.city && property.state ? ', ' : ''}
                        {property.state} {property.zip}
                      </>
                    )}
                  </p>
                )}
                {property.type && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {property.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DocumentItemsTableProps {
  items: Array<{
    name?: string;
    description?: string;
    quantity?: string | number;
    rate?: string | number;
    price?: string | number;
    amount?: string | number;
    total?: string | number;
  }>;
  currencySymbol?: string;
}

export const DocumentItemsTable: React.FC<DocumentItemsTableProps> = ({
  items,
  currencySymbol = '$',
}) => {
  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th
                scope="col"
                className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="text-center py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Qty
              </th>
              <th
                scope="col"
                className="text-right py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell"
              >
                Rate
              </th>
              <th
                scope="col"
                className="text-right py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, index) => {
              const quantity = parseFloat(String(item.quantity || '1'));
              const rate = parseFloat(String(item.rate || item.price || item.amount || '0'));
              const amount = parseFloat(String(item.total || item.amount || quantity * rate || '0'));

              return (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      {item.name || item.description || `Item ${index + 1}`}
                    </p>
                    {item.name && item.description && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {/* Show rate on mobile under description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
                      {formatCurrency(rate)} each
                    </p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {quantity}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-6 text-right text-gray-600 dark:text-gray-300 text-sm sm:text-base hidden sm:table-cell">
                    {formatCurrency(rate)}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-right font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {formatCurrency(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface DocumentTotalsProps {
  subtotal: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  total: number;
  paidAmount?: number;
  currencySymbol?: string;
}

export const DocumentTotals: React.FC<DocumentTotalsProps> = ({
  subtotal,
  taxAmount,
  taxRate,
  discountAmount,
  total,
  paidAmount,
  currencySymbol = '$',
}) => {
  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const balance = paidAmount !== undefined ? total - paidAmount : 0;
  const isPaid = balance <= 0 && paidAmount !== undefined && paidAmount > 0;

  return (
    <div
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6"
      role="region"
      aria-label="Document totals"
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {discountAmount !== undefined && discountAmount > 0 && (
          <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <span>Discount</span>
            <span className="text-red-600 dark:text-red-400">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        {taxAmount !== undefined && taxAmount > 0 && (
          <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <span>
              Tax
              {taxRate !== undefined && taxRate > 0 && ` (${taxRate}%)`}
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {paidAmount !== undefined && paidAmount > 0 && (
          <>
            <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-300">
              <span>Paid</span>
              <span className="text-green-600 dark:text-green-400">
                -{formatCurrency(paidAmount)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-lg sm:text-xl font-bold">
                <span className="text-gray-900 dark:text-white">
                  {isPaid ? 'Balance' : 'Balance Due'}
                </span>
                <span
                  className={cn(
                    isPaid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isPaid ? 'PAID' : formatCurrency(balance)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface DocumentNotesProps {
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'success';
}

export const DocumentNotes: React.FC<DocumentNotesProps> = ({
  title = 'Notes',
  content,
  type = 'info',
}) => {
  if (!content) return null;

  const bgColor =
    type === 'warning'
      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      : type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';

  const textColor =
    type === 'warning'
      ? 'text-yellow-800 dark:text-yellow-200'
      : type === 'success'
        ? 'text-green-800 dark:text-green-200'
        : 'text-blue-800 dark:text-blue-200';

  const titleColor =
    type === 'warning'
      ? 'text-yellow-900 dark:text-yellow-100'
      : type === 'success'
        ? 'text-green-900 dark:text-green-100'
        : 'text-blue-900 dark:text-blue-100';

  return (
    <div
      className={cn('rounded-lg p-4 sm:p-6 border mb-4', bgColor)}
      role="note"
    >
      <h3 className={cn('font-semibold mb-2 text-sm sm:text-base', titleColor)}>
        {title}
      </h3>
      <p className={cn('text-xs sm:text-sm opacity-90 whitespace-pre-wrap', textColor)}>
        {content}
      </p>
    </div>
  );
};
