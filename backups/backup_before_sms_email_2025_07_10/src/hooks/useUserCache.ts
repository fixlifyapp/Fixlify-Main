import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export const useUserCache = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const getCurrentUserId = () => {
    return user?.id || null;
  };
  
  const cacheUserData = (key: string, data: any) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn("No user ID available for caching");
      return;
    }
    
    const cacheKey = `${userId}:${key}`;
    queryClient.setQueryData([cacheKey], data);
  };
  
  const getCachedUserData = (key: string) => {
    const userId = getCurrentUserId();
    if (!userId) return null;
    
    const cacheKey = `${userId}:${key}`;
    return queryClient.getQueryData([cacheKey]);
  };
  
  const invalidateUserCache = (key: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const cacheKey = `${userId}:${key}`;
    queryClient.invalidateQueries({ queryKey: [cacheKey] });
  };
  
  const clearAllUserCache = () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // This will invalidate all queries that start with the user ID
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey;
        return Array.isArray(queryKey) && 
               queryKey[0] && 
               typeof queryKey[0] === 'string' && 
               queryKey[0].startsWith(`${userId}:`);
      }
    });
  };
  
  return { 
    cacheUserData, 
    getCachedUserData,
    invalidateUserCache,
    clearAllUserCache,
    getCurrentUserId
  };
};