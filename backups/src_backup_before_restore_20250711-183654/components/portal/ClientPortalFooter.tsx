import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Clock
} from 'lucide-react';

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

const ClientPortalFooter: React.FC<ClientPortalFooterProps> = ({ companyData }) => {
  const currentYear = new Date().getFullYear();
  
  // Use company data or fallback to defaults
  const companyName = companyData?.name || 'Fixlify';
  const companyEmail = companyData?.email || 'support@fixlify.app';
  const companyPhone = companyData?.phone || '+1 (555) 123-4567';
  const companyAddress = companyData?.address ? 
    `${companyData.address}${companyData.city ? `, ${companyData.city}` : ''}${companyData.state ? `, ${companyData.state}` : ''}${companyData.zip ? ` ${companyData.zip}` : ''}` : 
    '123 Tech Street, City, State 12345';
  
  // Parse business hours for display
  const getBusinessHours = () => {
    if (!companyData?.business_hours) {
      return 'Mon-Fri: 9AM-6PM';
    }
    
    try {
      // Try to parse if it's a JSON string
      const hours = typeof companyData.business_hours === 'string' 
        ? JSON.parse(companyData.business_hours) 
        : companyData.business_hours;
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const enabledDays = days.filter(day => hours[day]?.enabled);
      
      if (enabledDays.length === 0) return 'By Appointment';
      
      // Check if all enabled days have the same hours
      const firstDay = enabledDays[0];
      const firstStart = hours[firstDay].start;
      const firstEnd = hours[firstDay].end;
      
      const allSameHours = enabledDays.every(day => 
        hours[day].start === firstStart && hours[day].end === firstEnd
      );
      
      if (allSameHours && enabledDays.length === 5) {
        return `Mon-Fri: ${formatTime(firstStart)}-${formatTime(firstEnd)}`;
      }
      
      return 'Varies by Day';
    } catch (e) {
      // If parsing fails, return the string as is or default
      return typeof companyData.business_hours === 'string' 
        ? companyData.business_hours 
        : 'Mon-Fri: 9AM-6PM';
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum || 12;
    return `${displayHour}${minute !== '00' ? `:${minute}` : ''}${ampm}`;
  };

  return (
    <footer className="relative mt-auto">
      {/* 3D Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {companyName}
                </h3>
              </div>
              
              <div className="space-y-2">
                {companyAddress && (
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{companyAddress}</span>
                  </div>
                )}
                {companyPhone && (
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{companyPhone}</span>
                  </div>
                )}
                {companyEmail && (
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{companyEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <div className="text-sm">
                  <p className="text-gray-300 font-medium">Business Hours</p>
                  <p className="text-gray-500">{getBusinessHours()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center text-gray-400 text-sm">
              © {currentYear} {companyName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientPortalFooter;
