import { SectionCard, SectionHeader } from "../shared";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfoSectionProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  onCall?: () => void;
  onEmail?: () => void;
  onViewClient?: () => void;
}

export const ClientInfoSection = ({
  name,
  email,
  phone,
  address,
  onCall,
  onEmail,
  onViewClient
}: ClientInfoSectionProps) => {
  const handleAddressClick = () => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={User}
        title="Client"
        action={
          onViewClient && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewClient}
              className="h-7 text-xs text-slate-500 hover:text-slate-700"
            >
              View Profile
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          )
        }
      />

      <div className="space-y-3">
        {/* Client Name */}
        <div className="pb-3 border-b border-slate-100">
          <h4 className="font-semibold text-slate-900">{name}</h4>
        </div>

        {/* Contact Details */}
        <div className="space-y-2">
          {phone && (
            <button
              onClick={onCall}
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{phone}</span>
            </button>
          )}

          {email && (
            <button
              onClick={onEmail}
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="p-1.5 bg-emerald-50 rounded-md">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-700 truncate group-hover:text-slate-900">{email}</span>
            </button>
          )}

          {address && (
            <button
              onClick={handleAddressClick}
              className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="p-1.5 bg-amber-50 rounded-md">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-sm text-slate-700 flex-1 truncate group-hover:text-slate-900">{address}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
            </button>
          )}
        </div>
      </div>
    </SectionCard>
  );
};
