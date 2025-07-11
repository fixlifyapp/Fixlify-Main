
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamInvitationData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  serviceArea?: string;
  sendWelcomeEmail: boolean;
}

export const useTeamInvitations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendInvitation = async (invitationData: TeamInvitationData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: invitationData
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(data?.message || 'Invitation sent successfully');
      return { success: true, data };
      
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to fetch invitations');
      return { success: false, error };
    }
  };

  const updateInvitationStatus = async (invitationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating invitation status:', error);
      return { success: false, error };
    }
  };

  return {
    sendInvitation,
    getInvitations,
    updateInvitationStatus,
    isSubmitting
  };
};
