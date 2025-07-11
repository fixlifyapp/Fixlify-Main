import React from 'react';
import { format } from 'date-fns';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  User,
  Calendar,
  Hash,
  FileText,
  Receipt
} from 'lucide-react';

interface DocumentHeaderProps {
  type: 'estimate' | 'invoice';
  documentNumber: string;
  date: string;
  dueDate?: string;
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
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  type,
  documentNumber,
  date,
  dueDate,
  status,
  company,
  client
}) => {
  const isEstimate = type === 'estimate';
  const primaryColor = isEstimate ? 'purple' : 'green';
  const gradientFrom = isEstimate ? 'from-purple-600' : 'from-green-600';
  const gradientTo = isEstimate ? 'to-purple-700' : 'to-green-700';

  return (
    <div className="bg-white rounded-t-2xl shadow-sm">
      {/* Header Bar */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-8 rounded-t-2xl`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isEstimate ? 'ESTIMATE' : 'INVOICE'}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                <span className="text-lg font-medium">{documentNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{format(new Date(date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="h-16 mb-2" />
            ) : (
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            )}
            {status && (
              <div className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                ${status === 'paid' || status === 'accepted' ? 'bg-green-100 text-green-800' : 
                  status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                  status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}
              `}>
                {status.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* From (Company) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">From</h3>
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-gray-900">{company?.name || 'Your Company'}</h4>
            
            {company?.address && (
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p>{company.address}</p>
                  {(company.city || company.state || company.zip) && (
                    <p>
                      {company.city}{company.city && company.state ? ', ' : ''}
                      {company.state} {company.zip}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {company?.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{company.phone}</span>
                </div>
              )}
              
              {company?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{company.email}</span>
                </div>
              )}
              
              {company?.website && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <span>{company.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* To (Client) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {isEstimate ? 'To' : 'Bill To'}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{client?.name || 'Client Name'}</h4>
              {client?.company && (
                <p className="text-gray-600">{client.company}</p>
              )}
            </div>
            
            {client?.address && (
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p>{client.address}</p>
                  {(client.city || client.state || client.zip) && (
                    <p>
                      {client.city}{client.city && client.state ? ', ' : ''}
                      {client.state} {client.zip}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {client?.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              
              {client?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{client.email}</span>
                </div>
              )}
            </div>

            {/* Due Date for Invoices */}
            {!isEstimate && dueDate && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Due Date:</span> {format(new Date(dueDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DocumentItemsTableProps {
  items: any[];
  currencySymbol?: string;
}

export const DocumentItemsTable: React.FC<DocumentItemsTableProps> = ({ 
  items, 
  currencySymbol = '$' 
}) => {
  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Qty
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Rate
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const quantity = parseFloat(item.quantity || '1');
              const rate = parseFloat(item.rate || item.price || item.amount || '0');
              const amount = parseFloat(item.total || item.amount || (quantity * rate) || '0');
              
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">
                      {item.name || item.description || `Item ${index + 1}`}
                    </p>
                    {item.name && item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    {quantity}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-600">
                    {formatCurrency(rate)}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-900">
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
  currencySymbol = '$'
}) => {
  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const balance = paidAmount !== undefined ? total - paidAmount : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {discountAmount && discountAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        {(taxAmount !== undefined && taxAmount > 0) && (
          <div className="flex justify-between text-gray-600">
            <span>
              Tax
              {taxRate !== undefined && taxRate > 0 && ` (${taxRate}%)`}
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        
        {paidAmount !== undefined && paidAmount > 0 && (
          <>
            <div className="flex justify-between text-gray-600">
              <span>Paid</span>
              <span className="text-green-600">-{formatCurrency(paidAmount)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xl font-bold">
                <span>Balance Due</span>
                <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(balance)}
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
  type = 'info'
}) => {
  if (!content) return null;

  const bgColor = type === 'warning' ? 'bg-yellow-50' : 
                  type === 'success' ? 'bg-green-50' : 
                  'bg-blue-50';
  
  const textColor = type === 'warning' ? 'text-yellow-800' : 
                    type === 'success' ? 'text-green-800' : 
                    'text-blue-800';

  return (
    <div className={`rounded-lg p-6 ${bgColor}`}>
      <h3 className={`font-semibold mb-2 ${textColor}`}>{title}</h3>
      <p className={`text-sm ${textColor} opacity-90 whitespace-pre-wrap`}>{content}</p>
    </div>
  );
};
