
import React from "react";
import { JobDetailsEditDialog } from "../dialogs/JobDetailsEditDialog";
import { JobTypeDialog } from "../dialogs/JobTypeDialog";
import { TeamSelectionDialog } from "../dialogs/TeamSelectionDialog";
import { SourceSelectionDialog } from "../dialogs/SourceSelectionDialog";
import { ScheduleSelectionDialog } from "../dialogs/ScheduleSelectionDialog";
import { TagsManagementDialog } from "../dialogs/TagsManagementDialog";
import { TaskManagementDialog } from "../dialogs/TaskManagementDialog";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";
import { ApplianceTypeDialog } from "../dialogs/ApplianceTypeDialog";

interface DialogStates {
  isDescriptionDialogOpen: boolean;
  isTypeDialogOpen: boolean;
  isTeamDialogOpen: boolean;
  isSourceDialogOpen: boolean;
  isScheduleDialogOpen: boolean;
  isTagsDialogOpen: boolean;
  isTasksDialogOpen: boolean;
  isAttachmentsDialogOpen: boolean;
  isApplianceDialogOpen: boolean;
}

interface DialogSetters {
  setIsDescriptionDialogOpen: (open: boolean) => void;
  setIsTypeDialogOpen: (open: boolean) => void;
  setIsTeamDialogOpen: (open: boolean) => void;
  setIsSourceDialogOpen: (open: boolean) => void;
  setIsScheduleDialogOpen: (open: boolean) => void;
  setIsTagsDialogOpen: (open: boolean) => void;
  setIsTasksDialogOpen: (open: boolean) => void;
  setIsAttachmentsDialogOpen: (open: boolean) => void;
  setIsApplianceDialogOpen: (open: boolean) => void;
}

interface JobDetailsDialogsProps {
  jobId: string;
  dialogStates: DialogStates;
  dialogSetters: DialogSetters;
  jobDetails: {
    description: string;
    type: string;
    team: string;
    source: string;
    scheduleDate: string;
    scheduleTime: string;
    tags: string[];
  };
  tasks: Array<{ id: number; name: string; completed: boolean }>;
  appliances: Array<{ id: number; type: "dryer" | "dishwasher" | "fridge" | "washer"; model?: string }>;
  onUpdateDescription: (description: string) => void;
  onUpdateType: (type: string) => void;
  onUpdateTeam: (team: string) => void;
  onUpdateSource: (source: string) => void;
  onUpdateSchedule: (date: string, timeWindow: string) => void;
  onUpdateTags: (tags: string[]) => void;
  onUpdateTasks: (tasks: Array<{ id: number; name: string; completed: boolean }>) => void;
  onUpdateAppliances: (appliances: Array<{ id: number; type: "dryer" | "dishwasher" | "fridge" | "washer"; model?: string }>) => void;
}

export const JobDetailsDialogs = ({
  jobId,
  dialogStates,
  dialogSetters,
  jobDetails,
  tasks,
  appliances,
  onUpdateDescription,
  onUpdateType,
  onUpdateTeam,
  onUpdateSource,
  onUpdateSchedule,
  onUpdateTags,
  onUpdateTasks,
  onUpdateAppliances
}: JobDetailsDialogsProps) => {
  return (
    <>
      <JobDetailsEditDialog
        open={dialogStates.isDescriptionDialogOpen}
        onOpenChange={dialogSetters.setIsDescriptionDialogOpen}
        initialDescription={jobDetails.description}
        onSave={onUpdateDescription}
        jobId={jobId}
      />
      
      <JobTypeDialog
        open={dialogStates.isTypeDialogOpen}
        onOpenChange={dialogSetters.setIsTypeDialogOpen}
        initialType={jobDetails.type}
        onSave={onUpdateType}
      />
      
      <TeamSelectionDialog
        open={dialogStates.isTeamDialogOpen}
        onOpenChange={dialogSetters.setIsTeamDialogOpen}
        initialTeam={jobDetails.team}
        onSave={onUpdateTeam}
      />
      
      <SourceSelectionDialog
        open={dialogStates.isSourceDialogOpen}
        onOpenChange={dialogSetters.setIsSourceDialogOpen}
        initialSource={jobDetails.source}
        onSave={onUpdateSource}
      />
      
      <ScheduleSelectionDialog
        open={dialogStates.isScheduleDialogOpen}
        onOpenChange={dialogSetters.setIsScheduleDialogOpen}
        initialDate={jobDetails.scheduleDate}
        initialTimeWindow={jobDetails.scheduleTime}
        onSave={onUpdateSchedule}
      />
      
      <TagsManagementDialog
        open={dialogStates.isTagsDialogOpen}
        onOpenChange={dialogSetters.setIsTagsDialogOpen}
        initialTags={jobDetails.tags}
        onSave={onUpdateTags}
      />
      
      <TaskManagementDialog
        open={dialogStates.isTasksDialogOpen}
        onOpenChange={dialogSetters.setIsTasksDialogOpen}
        initialTasks={tasks}
        onSave={onUpdateTasks}
      />
      
      <AttachmentUploadDialog
        open={dialogStates.isAttachmentsDialogOpen}
        onOpenChange={dialogSetters.setIsAttachmentsDialogOpen}
        jobId={jobId}
        onUploadSuccess={() => {
          dialogSetters.setIsAttachmentsDialogOpen(false);
        }}
      />
      
      <ApplianceTypeDialog
        open={dialogStates.isApplianceDialogOpen}
        onOpenChange={dialogSetters.setIsApplianceDialogOpen}
        initialAppliances={appliances}
        onSave={onUpdateAppliances}
      />
    </>
  );
};
