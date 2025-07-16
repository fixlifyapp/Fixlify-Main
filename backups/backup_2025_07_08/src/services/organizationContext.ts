import { supabase } from '@/integrations/supabase/client';

/**
 * OrganizationContext Service
 * 
 * This service provides a centralized way to handle organization context
 * throughout the application. It ensures consistency in how we query
 * organization-specific data.
 */
export class OrganizationContextService {
  private static instance: OrganizationContextService;
  private organizationId: string | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): OrganizationContextService {
    if (!OrganizationContextService.instance) {
      OrganizationContextService.instance = new OrganizationContextService();
    }
    return OrganizationContextService.instance;
  }

  /**
   * Initialize the service with user and organization IDs
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    // Fetch the user's organization ID from their profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    
    if (!error && profile?.organization_id) {
      this.organizationId = profile.organization_id;
    } else {
      console.warn('No organization_id found for user:', userId);
      // For backward compatibility, use user_id as organization_id
      this.organizationId = userId;
    }
  }

  /**
   * Get the current organization ID
   */
  getOrganizationId(): string | null {
    return this.organizationId;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Build a query filter that works for both organization_id and user_id
   * This ensures backward compatibility while transitioning to organization-based queries
   */
  getQueryFilter(): string {
    if (this.organizationId && this.userId) {
      // Query for both organization_id and user_id for backward compatibility
      return `organization_id.eq.${this.organizationId},user_id.eq.${this.userId}`;
    } else if (this.organizationId) {
      return `organization_id.eq.${this.organizationId}`;
    } else if (this.userId) {
      return `user_id.eq.${this.userId}`;
    }
    return '';
  }

  /**
   * Get filter object for Supabase queries
   */
  getFilterObject(): { organization_id?: string; user_id?: string } {
    const filter: { organization_id?: string; user_id?: string } = {};
    
    if (this.organizationId) {
      filter.organization_id = this.organizationId;
    }
    if (this.userId) {
      filter.user_id = this.userId;
    }
    
    return filter;
  }

  /**
   * Apply organization context to a Supabase query
   * This method adds the appropriate filters based on available context
   */
  applyToQuery(query: any): any {
    if (this.organizationId && this.userId) {
      // For backward compatibility, check both organization_id and user_id
      return query.or(`organization_id.eq.${this.organizationId},user_id.eq.${this.userId}`);
    } else if (this.organizationId) {
      return query.eq('organization_id', this.organizationId);
    } else if (this.userId) {
      return query.eq('user_id', this.userId);
    }
    return query;
  }

  /**
   * Clear the context (useful for logout)
   */
  clear(): void {
    this.organizationId = null;
    this.userId = null;
  }
}

// Export a singleton instance
export const organizationContext = OrganizationContextService.getInstance();
