import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Wrench,
  FileText,
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
  
  const footerLinks = {
    services: [
      { name: 'Computer Repair', path: '/services/computer-repair', icon: Wrench },
      { name: 'Phone Repair', path: '/services/phone-repair', icon: Phone },
      { name: 'Tablet Repair', path: '/services/tablet-repair', icon: Shield },
      { name: 'Data Recovery', path: '/services/data-recovery', icon: FileText }
    ],
    quickLinks: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'FAQs', path: '/faqs' }
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Warranty', path: '/warranty' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, url: `https://facebook.com/${companyName.toLowerCase().replace(/\s+/g, '')}`, label: 'Facebook' },
    { icon: Twitter, url: `https://twitter.com/${companyName.toLowerCase().replace(/\s+/g, '')}`, label: 'Twitter' },
    { icon: Instagram, url: `https://instagram.com/${companyName.toLowerCase().replace(/\s+/g, '')}`, label: 'Instagram' }
  ];

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
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {companyName}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for all device repairs. Fast, reliable, and professional service.
              </p>
              <div className="space-y-2">
                {companyAddress && (
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{companyAddress}</span>
                  </div>
                )}
                {companyPhone && (
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{companyPhone}</span>
                  </div>
                )}
                {companyEmail && (
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{companyEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Our Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((service) => (
                  <li key={service.path}>
                    <Link 
                      to={service.path}
                      className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <service.icon className="w-4 h-4" />
                      <span className="text-sm">{service.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Stay Connected</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-3">
                    Subscribe to get updates on our latest offers and services.
                  </p>
                  <form className="flex flex-col space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
                
                {/* Social Links */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Follow us on social media</p>
                  <div className="flex space-x-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-700/50 hover:border-blue-500 transition-all duration-200 group"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {currentYear} {companyName}. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours Badge */}
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 hidden lg:block">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-400" />
            <div className="text-sm">
              <p className="text-gray-300 font-medium">Business Hours</p>
              <p className="text-gray-500">{getBusinessHours()}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientPortalFooter;