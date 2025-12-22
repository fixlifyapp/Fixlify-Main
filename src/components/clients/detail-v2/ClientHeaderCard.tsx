import { Phone, Mail, MessageSquare, Plus, Building2, Home, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClientHeaderCardProps {
  client: {
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    status?: string;
    client_type?: string;
    company?: string;
    created_at?: string;
  } | null;
  onCall?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  onCreateJob?: () => void;
}

const getInitials = (name: string, firstName?: string, lastName?: string): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'inactive':
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    case 'lead':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default:
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  }
};

const getTypeIcon = (clientType?: string) => {
  switch (clientType?.toLowerCase()) {
    case 'commercial':
      return Building2;
    case 'residential':
      return Home;
    default:
      return User;
  }
};

export const ClientHeaderCard = ({
  client,
  onCall,
  onMessage,
  onEmail,
  onCreateJob
}: ClientHeaderCardProps) => {
  if (!client) return null;

  const initials = getInitials(client.name, client.first_name, client.last_name);
  const TypeIcon = getTypeIcon(client.client_type);
  const memberSince = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Avatar */}
        <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-xl font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Client Info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {client.name}
            </h1>
            <Badge
              variant="outline"
              className={cn("font-medium capitalize border", getStatusColor(client.status))}
            >
              {client.status || 'active'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {client.client_type && (
              <span className="flex items-center gap-1.5">
                <TypeIcon className="h-4 w-4" />
                <span className="capitalize">{client.client_type}</span>
              </span>
            )}
            {client.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {client.company}
              </span>
            )}
            {memberSince && (
              <span className="text-muted-foreground/70">
                Client since {memberSince}
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground/50">
              {client.id}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCall}
              className="gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMessage}
              className="gap-2 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEmail}
              className="gap-2 hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-500/30 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              size="sm"
              onClick={onCreateJob}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
