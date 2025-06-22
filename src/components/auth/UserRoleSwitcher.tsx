import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRBAC } from "./RBACProvider";
import { cn } from "@/lib/utils";
import { User, UserRole } from "./types";
import { toast } from "sonner";

const roleDisplayNames: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  dispatcher: "Dispatcher",
  technician: "Technician"
};

const demoUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@fixlify.com",
    role: "admin",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@fixlify.com",
    role: "manager",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4"
  },
  {
    id: "3",
    name: "Dispatcher User",
    email: "dispatcher@fixlyfy.com",
    role: "dispatcher",
    avatar: "https://avatars.githubusercontent.com/u/1500684?v=4"
  },
  {
    id: "4",
    name: "Technician User",
    email: "tech@fixlyfy.com",
    role: "technician",
    avatar: "https://avatars.githubusercontent.com/u/810438?v=4"
  }
];

export const UserRoleSwitcher = () => {
  const { currentUser, setCurrentUser } = useRBAC();
  
  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    toast.success(`Switched to ${roleDisplayNames[user.role]} role`);
  };
  
  if (!currentUser) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-fixlyfy/10">
            {currentUser.name.charAt(0)}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
            <div className="mt-1 flex items-center">
              <span className={cn(
                "text-xs rounded px-1 py-0.5 font-semibold",
                currentUser.role === "admin" ? "bg-red-100 text-red-800" :
                currentUser.role === "manager" ? "bg-blue-100 text-blue-800" :
                currentUser.role === "dispatcher" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              )}>
                {roleDisplayNames[currentUser.role]}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        {demoUsers.map(user => (
          <DropdownMenuItem 
            key={user.id}
            disabled={user.id === currentUser.id}
            onClick={() => handleUserSwitch(user)}
          >
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-fixlyfy/10 flex items-center justify-center text-[10px] mr-2">
                {user.name.charAt(0)}
              </div>
              <span>{roleDisplayNames[user.role]}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
