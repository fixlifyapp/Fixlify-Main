import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";
import { 
  X, 
  Trash2, 
  Download, 
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsBarProps {
  selectedCount: number;
  onUpdateStatus: (status: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onUpdateStatus,
  onDelete,
  onExport,
  onClearSelection
}: BulkActionsBarProps) => {
  return (
    <ModernCard variant="elevated" className="mb-4 p-4 bg-fixlyfy/5 border-fixlyfy/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onUpdateStatus('active')}>
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('inactive')}>
                <UserX className="h-4 w-4 mr-2 text-gray-600" />
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('lead')}>
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('prospect')}>
                <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                Prospect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      </div>
    </ModernCard>
  );
};