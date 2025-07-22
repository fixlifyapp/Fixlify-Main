import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useDataIsolation = () => {
  const { user } = useAuth();
  
  /**
   * Adds user_id filter to any Supabase query
   */
  const withUserFilter = <T extends any>(
    query: T
  ): T => {
    if (!user?.id) {
      console.error("No user ID available for data isolation");
      return query;
    }
    
    // Add user_id filter to the query
    return query.eq('user_id', user.id);
  };
  
  /**
   * Validates that a record belongs to the current user
   */
  const validateOwnership = (record: any): boolean => {
    if (!user?.id) return false;
    return record.user_id === user.id || record.created_by === user.id;
  };
  
  /**
   * Adds user_id to data before insert
   */
  const prepareInsert = <T extends Record<string, any>>(
    data: T
  ): T & { user_id: string; created_by: string } => {
    if (!user?.id) throw new Error("User not authenticated");
    
    return {
      ...data,
      user_id: user.id,
      created_by: user.id
    };
  };
  /**
   * Creates a safe query builder for a table
   */
  const createSafeQuery = (tableName: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    return {
      select: (columns = '*') => 
        withUserFilter(supabase.from(tableName).select(columns)),
      
      insert: (data: any) => {
        const safeData = Array.isArray(data) 
          ? data.map(item => prepareInsert(item))
          : prepareInsert(data);
        return supabase.from(tableName).insert(safeData);
      },
      
      update: (data: any) => 
        withUserFilter(supabase.from(tableName).update(data)),
      
      delete: () => 
        withUserFilter(supabase.from(tableName).delete()),
      
      // For counting records
      count: () => 
        withUserFilter(
          supabase.from(tableName).select('*', { count: 'exact', head: true })
        )
    };
  };
  
  return {
    withUserFilter,
    validateOwnership,
    prepareInsert,
    createSafeQuery,
    userId: user?.id
  };
};