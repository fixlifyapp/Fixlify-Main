
import { useState, useEffect } from "react";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { formatDistanceToNow } from "date-fns";
import { Clock, Mail, Phone, User } from "lucide-react";

interface TeamInvitation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  service_area?: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export function TeamInvitations() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getInvitations, updateInvitationStatus } = useTeamInvitations();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    const result = await getInvitations();
    if (result.success) {
      setInvitations(result.data || []);
    }
    setIsLoading(false);
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Implement resend logic if needed
    console.log('Resending invitation:', invitationId);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const result = await updateInvitationStatus(invitationId, 'cancelled');
    if (result.success) {
      fetchInvitations();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ModernCard>
        <ModernCardContent className="p-6">
          <div className="text-center">Loading invitations...</div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard>
      <ModernCardContent className="p-0">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Team Invitations</h3>
          <p className="text-sm text-muted-foreground">
            Manage pending team member invitations
          </p>
        </div>
        
        {invitations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        {invitation.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={12} />
                          {invitation.email}
                        </div>
                        {invitation.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone size={12} />
                            {invitation.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invitation.status)}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {invitation.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            Resend
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
}
