import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/use-organization';
import { useAuth } from '@/hooks/use-auth';

/**
 * Hook to fetch the organization's primary phone number from purchased Telnyx numbers.
 * Falls back to the first active phone number if no primary is set.
 */
export const useOrganizationPhoneNumber = () => {
  const { organization } = useOrganization();
  const { user } = useAuth();

  const { data: phoneNumber, isLoading } = useQuery({
    queryKey: ['organization-phone-number', organization?.id, user?.id],
    queryFn: async () => {
      // First try to get by organization_id
      if (organization?.id) {
        // Try to get the primary phone number first (without status filter since it may vary)
        const { data: primaryPhone, error: primaryError } = await supabase
          .from('phone_numbers')
          .select('phone_number, friendly_name, is_primary, status')
          .eq('organization_id', organization.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (!primaryError && primaryPhone?.phone_number) {
          return primaryPhone.phone_number;
        }

        // If no primary, get the first phone number for the organization
        const { data: anyPhone, error: anyError } = await supabase
          .from('phone_numbers')
          .select('phone_number, friendly_name, status')
          .eq('organization_id', organization.id)
          .order('is_primary', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!anyError && anyPhone?.phone_number) {
          return anyPhone.phone_number;
        }
      }

      // Fallback: try by user_id
      if (user?.id) {
        const { data: userPhone, error: userError } = await supabase
          .from('phone_numbers')
          .select('phone_number, friendly_name, status')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!userError && userPhone?.phone_number) {
          return userPhone.phone_number;
        }
      }

      return null;
    },
    enabled: !!(organization?.id || user?.id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Format phone number for display (e.g., +14375249932 -> (437) 524-9932)
  const formatPhoneNumber = (phone: string | null): string => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    // Handle +1XXXXXXXXXX format
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const areaCode = cleaned.slice(1, 4);
      const first = cleaned.slice(4, 7);
      const last = cleaned.slice(7, 11);
      return `(${areaCode}) ${first}-${last}`;
    }

    // Handle XXXXXXXXXX format
    if (cleaned.length === 10) {
      const areaCode = cleaned.slice(0, 3);
      const first = cleaned.slice(3, 6);
      const last = cleaned.slice(6, 10);
      return `(${areaCode}) ${first}-${last}`;
    }

    return phone;
  };

  return {
    phoneNumber,
    formattedPhoneNumber: formatPhoneNumber(phoneNumber),
    isLoading,
  };
};
