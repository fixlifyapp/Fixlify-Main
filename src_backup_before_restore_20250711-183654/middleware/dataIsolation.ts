import { useAuth } from "@/hooks/useAuth";

export const useDataIsolation = () => {
  const { user } = useAuth();
  
  const addUserFilter = (query: any) => {
    if (!user?.id) throw new Error("User not authenticated");
    
    return {
      ...query,
      user_id: user.id
    };
  };
  
  const validateOwnership = (data: any) => {
    if (data.user_id !== user?.id) {
      throw new Error("Access denied: You don't own this resource");
    }
    return data;
  };
  
  return { addUserFilter, validateOwnership };
};