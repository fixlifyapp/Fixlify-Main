import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { X, CheckCircle, UserPlus, Trash, Tag, DollarSign, Download } from 'lucide-react';
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 py-3 px-4 flex items-center">
        <div className="container mx-auto flex flex-wrap items-center gap-3">
          <div className="bg-fixlyfy text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedJobs.length} jobs selected
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={onClearSelection}
          >
            <X size={14} />
            Clear
          </Button>
          
          <div className="ml-auto flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => onUpdateStatus(selectedJobs, 'completed')}
            >
              <CheckCircle size={14} />
              Mark Complete
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <UserPlus size={14} />
              Assign
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsTagDialogOpen(true)}
            >
              <Tag size={14} />
              Tag
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => onExport(selectedJobs)}
            >
              <Download size={14} />
              Export
            </Button>
            
            {onMarkAsPaid && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => onMarkAsPaid(selectedJobs, 'card')}
              >
                <DollarSign size={14} />
                Mark Paid
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash size={14} />
              Delete
            </Button>
          </div>
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
