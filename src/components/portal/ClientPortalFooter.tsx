import { Mail, Phone, Globe, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientPortalFooterProps {
  companyData?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
}

export const ClientPortalFooter = ({ companyData }: ClientPortalFooterProps) => {
  const currentYear = new Date().getFullYear();
  
  const supportEmail = companyData?.email || 'support@fixlify.app';
  const companyName = companyData?.name || 'Fixlify';
  const companyPhone = companyData?.phone;
  const companyWebsite = companyData?.website;
  const fullAddress = companyData?.address && companyData?.city && companyData?.state
    ? `${companyData.address}, ${companyData.city}, ${companyData.state} ${companyData.zip || ''}`
    : null;

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Contact Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Need Assistance?
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Our support team is ready to help you
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email */}
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Email us at</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {supportEmail}
                </p>
              </div>
            </a>
            
            {/* Phone */}
            {companyPhone && (
              <a
                href={`tel:${companyPhone}`}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Call us at</p>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    {companyPhone}
                  </p>
                </div>
              </a>
            )}
            
            {/* Website */}
            {companyWebsite && (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1"
              >
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Visit our website</p>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {companyWebsite.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </a>
            )}
          </div>
          
          {/* Business Hours */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Business Hours: Mon-Fri 8AM-6PM</span>
            </div>
          </div>
        </div>
        
        {/* Company Info */}
        <div className="text-center space-y-3">
          {fullAddress && (
            <p className="text-sm text-gray-600">
              {fullAddress}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500">
            <span>© {currentYear} {companyName}</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Powered by <span className="font-semibold text-blue-600">Fixlify</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
