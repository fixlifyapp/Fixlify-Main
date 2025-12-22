import { useState } from "react";
import { Phone, Mail, MapPin, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContactInfoCardProps {
  client: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
}

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export const ContactInfoCard = ({ client }: ContactInfoCardProps) => {
  if (!client) return null;

  const fullAddress = [
    client.address,
    client.city,
    client.state,
    client.zip
  ].filter(Boolean).join(', ');

  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">Contact Information</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Phone */}
        {client.phone && (
          <div className="flex items-center gap-3 group">
            <div className="shrink-0 rounded-lg p-2 bg-emerald-500/10">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
              <a
                href={`tel:${client.phone}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {client.phone}
              </a>
            </div>
            <CopyButton value={client.phone} label="Phone" />
          </div>
        )}

        {/* Email */}
        {client.email && (
          <div className="flex items-center gap-3 group">
            <div className="shrink-0 rounded-lg p-2 bg-blue-500/10">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <a
                href={`mailto:${client.email}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
              >
                {client.email}
              </a>
            </div>
            <CopyButton value={client.email} label="Email" />
          </div>
        )}

        {/* Address */}
        {fullAddress && (
          <div className="flex items-start gap-3 group">
            <div className="shrink-0 rounded-lg p-2 bg-violet-500/10 mt-0.5">
              <MapPin className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Address</p>
              <p className="text-sm font-medium text-foreground">
                {client.address}
              </p>
              {(client.city || client.state || client.zip) && (
                <p className="text-sm text-muted-foreground">
                  {[client.city, client.state, client.zip].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <CopyButton value={fullAddress} label="Address" />
              {mapsUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => window.open(mapsUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!client.phone && !client.email && !fullAddress && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No contact information available
          </p>
        )}
      </div>
    </div>
  );
};
