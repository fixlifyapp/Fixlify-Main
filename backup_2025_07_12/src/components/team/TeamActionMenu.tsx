
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Lock, UserMinus, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRBAC } from "@/components/auth/RBACProvider";

interface TeamActionMenuProps {
  userId: string;
  status: "active" | "suspended";
  testMode?: boolean;
}

export const TeamActionMenu = ({ userId, status, testMode = false }: TeamActionMenuProps) => {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const { hasPermission } = useRBAC();
  
  const canEditUsers = hasPermission("users.edit");
  const canEditPassword = hasPermission("users.edit");
  const canManageUserStatus = hasPermission("users.edit");
  
  const handleResetPassword = () => {
    if (!canEditPassword) {
      toast.error("You don't have permission to reset passwords");
      return;
    }
    
    // In a real app, this would call an API to reset the password
    console.log(`Resetting password for user ${userId}`);
    toast.success("Password reset link sent to user");
    
    if (testMode) {
      toast.info("Test Mode: Password reset simulated locally. Will integrate with Supabase Auth later.");
    }
    
    setIsResetPasswordOpen(false);
  };

  const handleToggleStatus = () => {
    if (!canManageUserStatus) {
      toast.error("You don't have permission to manage user status");
      return;
    }
    
    const newStatus = status === "active" ? "suspended" : "active";
    
    // In a real app, this would call an API to update the user's status
    console.log(`Updating status for user ${userId} to ${newStatus}`);
    toast.success(`User ${newStatus}`);
    
    if (testMode) {
      toast.info("Test Mode: Status changed locally only. Will be saved to Supabase after integration.");
    }
    
    setIsSuspendOpen(false);
  };

  // If user doesn't have permission to edit users, don't render the menu
  if (!canEditUsers) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEditPassword && (
            <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
          )}
          
          {canManageUserStatus && (
            <DropdownMenuItem onClick={() => setIsSuspendOpen(true)}>
              {status === "active" ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Suspend User
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate User
                </>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Reset Password Alert Dialog */}
      <AlertDialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset link to the user's email address. Are you sure you want to continue?
              {testMode && (
                <div className="mt-2 text-amber-500 text-sm font-medium">
                  Test Mode: This is a simulation and no email will be sent.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>Reset Password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Suspend/Activate User Alert Dialog */}
      <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === "active" ? "Suspend User?" : "Activate User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "active" 
                ? "This will prevent the user from logging in. Are you sure you want to continue?"
                : "This will allow the user to log in again. Are you sure you want to continue?"}
              
              {testMode && (
                <div className="mt-2 text-amber-500 text-sm font-medium">
                  Test Mode: Changes will only be reflected locally until Supabase integration.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {status === "active" ? "Suspend User" : "Activate User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
