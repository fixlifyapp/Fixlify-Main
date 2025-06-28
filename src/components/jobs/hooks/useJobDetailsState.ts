import { useState, useEffect } from "react";
import { useJobDetails } from "../context/JobDetailsContext";

export const useJobDetailsState = () => {
  const { job, isLoading } = useJobDetails();

  // Client info state
  const [clientInfo, setClientInfo] = useState({
    fullName: job?.client || "Loading...",
    address: job?.address || "Loading...",
    phone: job?.phone || "",
    email: job?.email || ""
  });

  // Job details state
  const [jobDetails, setJobDetails] = useState({
    description: job?.description || "Loading job description...",
    scheduleDate: "May 15, 2023",
    scheduleTime: "13:30 - 15:30",
    type: job?.service || "Loading...",
    tags: ["HVAC", "Residential"],
    team: "Robert Smith",
    source: "Phone Call"
  });

  // Other state
  const [appliances, setAppliances] = useState([
    { id: 1, type: "fridge" as const, model: "Samsung RF28R7551SR" },
    { id: 2, type: "washer" as const, model: "LG WM3900HWA" }
  ]);

  const [additionalJobTypes, setAdditionalJobTypes] = useState<string[]>([]);
  const [additionalSources, setAdditionalSources] = useState<string[]>([]);

  const [tasks, setTasks] = useState([
    { id: 1, name: "Initial diagnosis of HVAC unit", completed: true },
    { id: 2, name: "Check refrigerant levels", completed: false },
    { id: 3, name: "Clean condenser coils", completed: false }
  ]);

  const [attachments, setAttachments] = useState([
    { id: 1, name: "HVAC-specs.pdf", size: "210 KB" },
    { id: 2, name: "Previous-service.pdf", size: "185 KB" }
  ]);

  // Dialog states
  const [dialogStates, setDialogStates] = useState({
    isDescriptionDialogOpen: false,
    isTypeDialogOpen: false,
    isTeamDialogOpen: false,
    isSourceDialogOpen: false,
    isScheduleDialogOpen: false,
    isTagsDialogOpen: false,
    isTasksDialogOpen: false,
    isAttachmentsDialogOpen: false,
    isApplianceDialogOpen: false,
  });

  // Update states when job data loads
  useEffect(() => {
    if (job) {
      setClientInfo({
        fullName: job.client,
        address: job.address,
        phone: job.phone,
        email: job.email
      });

      setJobDetails(prev => ({
        ...prev,
        description: job.description || "No description provided",
        type: job.service || "General Service"
      }));
    }
  }, [job]);

  // Utility functions
  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "HVAC": "bg-purple-50 border-purple-200 text-purple-600",
      "Residential": "bg-blue-50 border-blue-200 text-blue-600",
      "Commercial": "bg-indigo-50 border-indigo-200 text-indigo-600",
      "Emergency": "bg-red-50 border-red-200 text-red-600",
      "Maintenance": "bg-green-50 border-green-200 text-green-600",
      "Installation": "bg-amber-50 border-amber-200 text-amber-600",
      "Repair": "bg-orange-50 border-orange-200 text-orange-600"
    };
    
    return tagColors[tag] || "bg-purple-50 border-purple-200 text-purple-600";
  };

  const getTeamColor = (team: string) => {
    const teamColors: Record<string, string> = {
      "Robert Smith": "text-purple-600",
      "Jane Cooper": "text-blue-600",
      "Michael Johnson": "text-green-600",
      "Sarah Williams": "text-pink-600",
      "David Martinez": "text-amber-600"
    };
    
    return teamColors[team] || "text-purple-600";
  };

  return {
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
  };
};
