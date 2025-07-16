
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Edit } from "lucide-react";

interface ScheduleInfo {
  scheduleDate: string;
  scheduleTime: string;
  team: string;
}

interface ScheduleSectionProps {
  scheduleInfo: ScheduleInfo;
  onScheduleEdit: () => void;
  onTeamEdit: () => void;
  getTeamColor: (team: string) => string;
}

export const ScheduleSection = ({ 
  scheduleInfo, 
  onScheduleEdit, 
  onTeamEdit, 
  getTeamColor 
}: ScheduleSectionProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onScheduleEdit}
          >
            <Edit size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Start Date</p>
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-purple-600" />
              <p className="text-purple-600">{scheduleInfo.scheduleDate}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Start Time</p>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-purple-600" />
              <p className="text-purple-600">{scheduleInfo.scheduleTime}</p>
            </div>
          </div>
          
          {/* Technician */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Technician</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTeamEdit}
              >
                <Edit size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} className={getTeamColor(scheduleInfo.team)} />
              <p className={getTeamColor(scheduleInfo.team)}>{scheduleInfo.team}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
