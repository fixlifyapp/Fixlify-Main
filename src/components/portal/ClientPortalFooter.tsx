import { Mail, Phone, Globe, MessageCircle, Clock, Heart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupportEmail } from "@/utils/email";

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
    business_hours?: string;
  } | null;
}

export const ClientPortalFooter = ({ companyData }: ClientPortalFooterProps) => {
  const currentYear = new Date().getFullYear();
  
  // Use dynamic email generation based on company name
  const supportEmail = getSupportEmail(companyData?.email, companyData?.name);
  const companyName = companyData?.name || 'Fixlify';
  const companyPhone = companyData?.phone;
  const companyWebsite = companyData?.website;
  const businessHours = companyData?.business_hours || 'Monday - Friday, 8:00 AM - 6:00 PM';
  const fullAddress = companyData?.address && companyData?.city && companyData?.state
    ? `${companyData.address}, ${companyData.city}, ${companyData.state} ${companyData.zip || ''}`
    : null;

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Contact Section */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-full text-white text-sm font-medium shadow-lg mb-4">
              <Zap className="h-4 w-4" />
              Premium Support
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Need Assistance?
            </h3>
            <p className="text-lg text-gray-700">
              Our support team is ready to help you
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email Card */}
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Mail className="h-7 w-7 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wider">EMAIL US AT</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {supportEmail}
                </p>
                <p className="text-xs text-gray-600 mt-1">Response within 24 hours</p>
              </div>
            </a>
            
            {/* Phone Card */}
            {companyPhone && (
              <a
                href={`tel:${companyPhone}`}
                className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">CALL US AT</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {companyPhone}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">We're here to help</p>
                </div>
              </a>
            )}
            
            {/* Website Card */}
            {companyWebsite && (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group sm:col-span-2 lg:col-span-1"
              >
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Globe className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">VISIT WEBSITE</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {companyWebsite.replace(/^https?:\/\//, '')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Learn more about us</p>
                </div>
              </a>
            )}
          </div>
          
          {/* Business Hours */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-gray-700">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Business Hours: {businessHours}</span>
            </div>
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-green-50 rounded-xl border border-green-200">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Secure Client Portal</span>
            <span className="text-xs text-green-600">256-bit Encryption</span>
          </div>
        </div>
        
        {/* Company Info */}
        <div className="text-center space-y-4">
          {fullAddress && (
            <p className="text-sm text-gray-600">
              {fullAddress}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
            <span className="text-gray-600">© {currentYear} {companyName}</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="text-gray-600">All rights reserved</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="flex items-center gap-2">
              <span className="text-gray-600">Powered by</span>
              <span className="font-bold text-purple-600">
                Fixlify
              </span>
            </span>
          </div>
          
          {/* Made with Love */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>for service businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};