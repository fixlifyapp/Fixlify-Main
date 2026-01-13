import { supabase } from '@/integrations/supabase/client';

/**
 * OrganizationContext Service
 *
 * This service provides a centralized way to handle organization context
 * throughout the application. It ensures consistency in how we query
 * organization-specific data for multi-tenant isolation.
 *
 * IMPORTANT: All data queries should use organization_id for proper
 * multi-tenant data isolation. user_id should only be used for
 * user-specific preferences, not data ownership.
 */
export class OrganizationContextService {
  private static instance: OrganizationContextService;
  private organizationId: string | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;

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

    // Fetch the user's organization ID and role from their profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single();

    if (!error && profile) {
      this.organizationId = profile.organization_id;
      this.userRole = profile.role;
    }

    if (!this.organizationId) {
      console.warn('No organization_id found for user:', userId);
      // User needs to be assigned to an organization
      // This should not happen for properly onboarded users
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
   * Get the current user's role
   */
  getUserRole(): string | null {
    return this.userRole;
  }

  /**
   * Check if user has a valid organization context
   */
  hasValidOrganization(): boolean {
    return !!this.organizationId && this.organizationId !== '00000000-0000-0000-0000-000000000001';
  }

  /**
   * Build a query filter for organization-scoped data
   * This returns the organization_id filter for multi-tenant isolation
   */
  getQueryFilter(): string {
    if (this.organizationId) {
      return `organization_id.eq.${this.organizationId}`;
    }
    // Fallback to user_id only if no organization
    if (this.userId) {
      return `user_id.eq.${this.userId}`;
    }
    return '';
  }

  /**
   * Get filter object for Supabase queries
   * Returns organization_id for multi-tenant queries
   */
  getFilterObject(): { organization_id?: string; user_id?: string } {
    if (this.hasValidOrganization()) {
      return { organization_id: this.organizationId! };
    }
    // Fallback for users without organization
    if (this.userId) {
      return { user_id: this.userId };
    }
    return {};
  }

  /**
   * Apply organization context to a Supabase query
   *
   * @param query - The Supabase query builder
   * @param options - Options for filtering
   * @param options.useOrganization - Whether to use organization_id (default: true)
   * @param options.userIdColumn - Column name for user_id fallback (default: 'user_id')
   */
  applyToQuery(
    query: any,
    options: { useOrganization?: boolean; userIdColumn?: string } = {}
  ): any {
    const { useOrganization = true, userIdColumn = 'user_id' } = options;

    if (useOrganization && this.hasValidOrganization()) {
      // Primary: Use organization_id for multi-tenant isolation
      return query.eq('organization_id', this.organizationId);
    }

    if (this.userId) {
      // Fallback: Use user_id for tables without organization_id
      return query.eq(userIdColumn, this.userId);
    }

    return query;
  }

  /**
   * Apply organization context for INSERT operations
   * Returns an object with organization_id to merge with insert data
   */
  getInsertContext(): { organization_id?: string } {
    if (this.hasValidOrganization()) {
      return { organization_id: this.organizationId! };
    }
    return {};
  }

  /**
   * Clear the context (useful for logout)
   */
  clear(): void {
    this.organizationId = null;
    this.userId = null;
    this.userRole = null;
  }
}

// Export a singleton instance
export const organizationContext = OrganizationContextService.getInstance();
