import { Phone, Mail, MessageSquare, Plus, Building2, Home, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

  const TypeIcon = getTypeIcon(client.client_type);
  const memberSince = client.created_at
    ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-2xl border border-fixlyfy/20 shadow-sm">
      {/* Background blur elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fixlyfy/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fixlyfy-light/5 rounded-full blur-3xl" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-white/50 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-fixlyfy to-fixlyfy-light text-white text-lg font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Client Name & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-fixlyfy truncate">
                {client.name}
              </h1>
              <Badge
                variant="outline"
                className={cn("font-medium capitalize border", getStatusColor(client.status))}
              >
                {client.status || 'active'}
              </Badge>
            </div>

            {/* Client Info */}
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
    </div>
  );
};
