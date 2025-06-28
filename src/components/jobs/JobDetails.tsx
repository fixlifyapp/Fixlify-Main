
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useJobDetailsState } from "./hooks/useJobDetailsState";
import { ClientInformationSection } from "./sections/ClientInformationSection";
import { JobDetailsSection } from "./sections/JobDetailsSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { TasksSection } from "./sections/TasksSection";
import { TagsAttachmentsSection } from "./sections/TagsAttachmentsSection";
import { JobDetailsDialogs } from "./sections/JobDetailsDialogs";

interface JobDetailsProps {
  jobId: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  const navigate = useNavigate();
  const {
    job,
    isLoading,
    clientInfo,
    setClientInfo,
    jobDetails,
    setJobDetails,
    appliances,
    setAppliances,
    additionalJobTypes,
    setAdditionalJobTypes,
    additionalSources,
    setAdditionalSources,
    tasks,
    setTasks,
    attachments,
    setAttachments,
    dialogStates,
    setDialogStates,
    getTagColor,
    getTeamColor
  } = useJobDetailsState();

  // Dialog setters
  const dialogSetters = {
    setIsDescriptionDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isDescriptionDialogOpen: open })),
    setIsTypeDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isTypeDialogOpen: open })),
    setIsTeamDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isTeamDialogOpen: open })),
    setIsSourceDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isSourceDialogOpen: open })),
    setIsScheduleDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isScheduleDialogOpen: open })),
    setIsTagsDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isTagsDialogOpen: open })),
    setIsTasksDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isTasksDialogOpen: open })),
    setIsAttachmentsDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isAttachmentsDialogOpen: open })),
    setIsApplianceDialogOpen: (open: boolean) => 
      setDialogStates(prev => ({ ...prev, isApplianceDialogOpen: open }))
  };

  // Update handlers
  const handleUpdateDescription = (description: string) => {
    setJobDetails(prev => ({ ...prev, description }));
  };

  const handleUpdateType = (type: string) => {
    setJobDetails(prev => ({ ...prev, type }));
  };

  const handleUpdateTeam = (team: string) => {
    setJobDetails(prev => ({ ...prev, team }));
  };

  const handleUpdateSource = (source: string) => {
    setJobDetails(prev => ({ ...prev, source }));
  };

  const handleUpdateSchedule = (date: string, timeWindow: string) => {
    setJobDetails(prev => ({ 
      ...prev, 
      scheduleDate: date,
      scheduleTime: timeWindow
    }));
  };

  const handleUpdateTags = (tags: string[]) => {
    setJobDetails(prev => ({ ...prev, tags }));
  };

  const handleUpdateTasks = (updatedTasks: typeof tasks) => {
    setTasks(updatedTasks);
  };

  const handleUpdateAttachments = (updatedAttachments: typeof attachments) => {
    setAttachments(updatedAttachments);
  };

  const handleUpdateAppliances = (updatedAppliances: typeof appliances) => {
    setAppliances(updatedAppliances);
  };

  const handleAddJobType = (type: string) => {
    if (type && !additionalJobTypes.includes(type)) {
      setAdditionalJobTypes([...additionalJobTypes, type]);
    }
  };

  const handleRemoveJobType = (index: number) => {
    const newTypes = [...additionalJobTypes];
    newTypes.splice(index, 1);
    setAdditionalJobTypes(newTypes);
  };

  const handleAddSource = (source: string) => {
    if (source && !additionalSources.includes(source)) {
      setAdditionalSources([...additionalSources, source]);
    }
  };

  const handleRemoveSource = (index: number) => {
    const newSources = [...additionalSources];
    newSources.splice(index, 1);
    setAdditionalSources(newSources);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Information Section */}
      <ClientInformationSection
        clientInfo={clientInfo}
        onClientInfoUpdate={setClientInfo}
        clientId={job.clientId}
      />
      
      {/* Job Details Section */}
      <JobDetailsSection
        jobDetails={jobDetails}
        onTypeClick={() => dialogSetters.setIsTypeDialogOpen(true)}
        onDescriptionClick={() => dialogSetters.setIsDescriptionDialogOpen(true)}
      />
      
      {/* Schedule Section */}
      <ScheduleSection
        scheduleInfo={{
          scheduleDate: jobDetails.scheduleDate,
          scheduleTime: jobDetails.scheduleTime,
          team: jobDetails.team
        }}
        onScheduleEdit={() => dialogSetters.setIsScheduleDialogOpen(true)}
        onTeamEdit={() => dialogSetters.setIsTeamDialogOpen(true)}
        getTeamColor={getTeamColor}
      />
      
      {/* Tasks Section */}
      <TasksSection
        tasks={tasks}
        onTasksEdit={() => dialogSetters.setIsTasksDialogOpen(true)}
      />
      
      {/* Tags & Attachments Section */}
      <TagsAttachmentsSection
        tags={jobDetails.tags}
        attachments={attachments}
        onTagsEdit={() => dialogSetters.setIsTagsDialogOpen(true)}
        onAttachmentsEdit={() => dialogSetters.setIsAttachmentsDialogOpen(true)}
        getTagColor={getTagColor}
      />
      
      {/* All Dialogs */}
      <JobDetailsDialogs
        jobId={jobId}
        dialogStates={dialogStates}
        dialogSetters={dialogSetters}
        jobDetails={jobDetails}
        tasks={tasks}
        appliances={appliances}
        onUpdateDescription={handleUpdateDescription}
        onUpdateType={handleUpdateType}
        onUpdateTeam={handleUpdateTeam}
        onUpdateSource={handleUpdateSource}
        onUpdateSchedule={handleUpdateSchedule}
        onUpdateTags={handleUpdateTags}
        onUpdateTasks={handleUpdateTasks}
        onUpdateAppliances={handleUpdateAppliances}
      />
    </div>
  );
};
