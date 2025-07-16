
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil, Mail } from "lucide-react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
  const { job } = useJobDetails();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCallClick = () => {
    // Use provided callback if available, otherwise use default navigation
    if (onCallClick) {
      onCallClick();
    } else if (job?.clientId && job?.client && job?.phone) {
      navigate(`/communications?tab=calls&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientPhone=${encodeURIComponent(job.phone)}`);
    }
  };

  const handleMessageClick = () => {
    // Use provided callback if available, otherwise use default navigation
    if (onMessageClick) {
      onMessageClick();
    } else if (job?.clientId && job?.client && job?.phone) {
      navigate(`/communications?tab=messages&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientPhone=${encodeURIComponent(job.phone)}&autoOpen=true`);
    }
  };

  const handleEmailClick = () => {
    if (job?.clientId && job?.client && job?.email) {
      navigate(`/communications?tab=emails&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientEmail=${encodeURIComponent(job.email)}&autoOpen=true`);
    }
  };

  const handleEditClient = () => {
    if (job?.clientId) {
      navigate(`/clients/${job.clientId}`);
    } else {
      console.error('No client ID available for editing');
    }
  };

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* Call Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-lg shadow-sm transition-all duration-200 text-xs"
          onClick={handleCallClick}
          disabled={!job?.phone}
          title="Call Client"
        >
          <Phone size={16} className="mr-1" />
          Call
        </Button>

        {/* Message Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-200 text-xs"
          onClick={handleMessageClick}
          disabled={!job?.phone}
          title="Send Message"
        >
          <MessageSquare size={16} className="mr-1" />
          Text
        </Button>

        {/* Email Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-lg shadow-sm transition-all duration-200 text-xs"
          onClick={handleEmailClick}
          disabled={!job?.email}
          title="Send Email"
        >
          <Mail size={16} className="mr-1" />
          Email
        </Button>

        {/* Edit Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-lg shadow-sm transition-all duration-200 text-xs"
          onClick={handleEditClient}
          title="Edit Client"
        >
          <Pencil size={16} className="mr-1" />
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Call Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleCallClick}
        disabled={!job?.phone}
        title="Call Client"
      >
        <Phone size={18} />
      </Button>

      {/* Message Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleMessageClick}
        disabled={!job?.phone}
        title="Send Message"
        aria-label="Send message"
      >
        <MessageSquare size={18} />
      </Button>

      {/* Email Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleEmailClick}
        disabled={!job?.email}
        title="Send Email"
        aria-label="Send email"
      >
        <Mail size={18} />
      </Button>

      {/* Edit Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="h-10 w-10 p-0 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleEditClient}
        title="Edit Client"
        aria-label="Edit client"
      >
        <Pencil size={18} />
      </Button>
    </div>
  );
};
