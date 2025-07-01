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
  } | null;
}

export const ClientPortalFooter = ({ companyData }: ClientPortalFooterProps) => {
  const currentYear = new Date().getFullYear();
  
  // Use dynamic email generation based on company name
  const supportEmail = getSupportEmail(companyData?.email, companyData?.name);
  const companyName = companyData?.name || 'Fixlify';
  const companyPhone = companyData?.phone;
  const companyWebsite = companyData?.website;
  const fullAddress = companyData?.address && companyData?.city && companyData?.state
    ? `${companyData.address}, ${companyData.city}, ${companyData.state} ${companyData.zip || ''}`
    : null;

  return (
    <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Contact Section with 3D Cards */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 mb-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium shadow-lg shadow-purple-500/30 mb-4">
              <Zap className="h-4 w-4" />
              Premium Support
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Need Assistance?
            </h3>
            <p className="text-lg text-purple-200">
              Our support team is ready to help you
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Email Card with 3D Effect */}
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group transform hover:-translate-y-1 border border-white/10"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-purple-200 uppercase tracking-wider">Email us at</p>
                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {supportEmail}
                </p>
                <p className="text-xs text-purple-300 mt-1">Response within 24 hours</p>
              </div>
            </a>
            
            {/* Phone Card with 3D Effect */}
            {companyPhone && (
              <a
                href={`tel:${companyPhone}`}
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl shadow-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 group transform hover:-translate-y-1 border border-white/10"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-green-200 uppercase tracking-wider">Call us at</p>
                  <p className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">
                    {companyPhone}
                  </p>
                  <p className="text-xs text-green-300 mt-1">Mon-Fri 8AM-6PM</p>
                </div>
              </a>
            )}
            
            {/* Website Card with 3D Effect */}
            {companyWebsite && (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 group transform hover:-translate-y-1 border border-white/10 sm:col-span-2 lg:col-span-1"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-purple-200 uppercase tracking-wider">Visit website</p>
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {companyWebsite.replace(/^https?:\/\//, '')}
                  </p>
                  <p className="text-xs text-purple-300 mt-1">Learn more about us</p>
                </div>
              </a>
            )}
          </div>
          
          {/* Business Hours with Glass Effect */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-purple-200 border border-white/20">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Business Hours: Monday - Friday, 8:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-green-500/30">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">Secure Client Portal</span>
            <span className="text-xs text-green-400">256-bit Encryption</span>
          </div>
        </div>
        
        {/* Company Info with Gradient Text */}
        <div className="text-center space-y-4">
          {fullAddress && (
            <p className="text-sm text-purple-200">
              {fullAddress}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
            <span className="text-purple-200">© {currentYear} {companyName}</span>
            <span className="hidden sm:inline text-purple-400">•</span>
            <span className="text-purple-200">All rights reserved</span>
            <span className="hidden sm:inline text-purple-400">•</span>
            <span className="flex items-center gap-2">
              <span className="text-purple-200">Powered by</span>
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fixlify
              </span>
            </span>
          </div>
          
          {/* Made with Love */}
          <div className="flex items-center justify-center gap-2 text-sm text-purple-300 pt-4">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>for service businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};