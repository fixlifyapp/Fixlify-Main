import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { X, CheckCircle, UserPlus, Trash2, Tag, DollarSign, Download } from 'lucide-react';
import { AssignTechnicianDialog } from './dialogs/AssignTechnicianDialog';
import { TagJobsDialog } from './dialogs/TagJobsDialog';
import { DeleteJobsDialog } from './dialogs/DeleteJobsDialog';

export interface BulkActionsBarProps {
  selectedJobs: string[];
  onClearSelection: () => void;
  onUpdateStatus: (jobIds: string[], newStatus: string) => void;
  onAssignTechnician: (jobIds: string[], technicianId: string, technicianName: string) => void;
  onDeleteJobs: (jobIds: string[]) => void;
  onTagJobs: (jobIds: string[], tags: string[]) => void;
  onMarkAsPaid?: (jobIds: string[], paymentMethod: string) => void;
  onExport: (jobIds: string[]) => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedJobs,
  onClearSelection,
  onUpdateStatus,
  onAssignTechnician,
  onDeleteJobs,
  onTagJobs,
  onMarkAsPaid,
  onExport
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (selectedJobs.length === 0) return null;

  const handleAssignSuccess = (technicianId: string, technicianName: string) => {
    onAssignTechnician(selectedJobs, technicianId, technicianName);
    setIsAssignDialogOpen(false);
  };

  const handleTagSuccess = (tags: string[]) => {
    onTagJobs(selectedJobs, tags);
    setIsTagDialogOpen(false);
  };

  const handleDeleteSuccess = () => {
    onDeleteJobs(selectedJobs);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Inline bar at top - matching Clients page style */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
              {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
            </span>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onUpdateStatus(selectedJobs, 'completed')}
            >
              <CheckCircle className="h-4 w-4" />
              Complete
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsTagDialogOpen(true)}
            >
              <Tag className="h-4 w-4" />
              Tag
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(selectedJobs)}
              className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            {onMarkAsPaid && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onMarkAsPaid(selectedJobs, 'card')}
              >
                <DollarSign className="h-4 w-4" />
                Mark Paid
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <AssignTechnicianDialog
          selectedJobs={selectedJobs}
          onOpenChange={setIsAssignDialogOpen}
          onSuccess={handleAssignSuccess}
        />
      </Dialog>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <TagJobsDialog
          selectedJobs={selectedJobs}
          onOpenChange={setIsTagDialogOpen}
          onSuccess={handleTagSuccess}
        />
      </Dialog>

      <DeleteJobsDialog
        open={isDeleteDialogOpen}
        selectedJobs={selectedJobs}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default BulkActionsBar;
