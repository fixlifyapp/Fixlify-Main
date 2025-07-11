
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardActionsProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardActions = ({ onRefresh, isRefreshing = false }: DashboardActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-fixlyfy hover:bg-fixlyfy/90"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            New Job
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigate("/jobs/new")}>
            Create Job
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/estimates/new")}>
            Create Estimate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/clients/new")}>
            Add Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
