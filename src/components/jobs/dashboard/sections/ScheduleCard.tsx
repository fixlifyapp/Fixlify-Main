import { SectionCard, SectionHeader } from "../shared";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit2, User } from "lucide-react";
import { format, formatDistanceToNow, isFuture, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  scheduleStart?: string;
  scheduleEnd?: string;
  technicianName?: string;
  onReschedule?: () => void;
  onChangeTechnician?: () => void;
}

export const ScheduleCard = ({
  scheduleStart,
  scheduleEnd,
  technicianName,
  onReschedule,
  onChangeTechnician
}: ScheduleCardProps) => {
  const startDate = scheduleStart ? new Date(scheduleStart) : null;
  const endDate = scheduleEnd ? new Date(scheduleEnd) : null;

  const getScheduleStatus = () => {
    if (!startDate) return { label: "Not scheduled", color: "text-slate-500", bgColor: "bg-slate-100" };
    if (isToday(startDate)) return { label: "Today", color: "text-blue-700", bgColor: "bg-blue-50" };
    if (isFuture(startDate)) return { label: "Upcoming", color: "text-emerald-700", bgColor: "bg-emerald-50" };
    if (isPast(startDate)) return { label: "Past", color: "text-slate-500", bgColor: "bg-slate-100" };
    return { label: "Scheduled", color: "text-slate-700", bgColor: "bg-slate-100" };
  };

  const status = getScheduleStatus();

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDate = (date: Date) => {
    return format(date, "EEE, MMM d, yyyy");
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={Calendar}
        title="Schedule"
        action={
          onReschedule && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReschedule}
              className="h-7 text-xs text-slate-500 hover:text-slate-700"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )
        }
      />

      <div className="space-y-3">
        {/* Date/Time Display */}
        {startDate ? (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg flex-shrink-0", status.bgColor)}>
                <Calendar className={cn("h-4 w-4", status.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{formatDate(startDate)}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatTime(startDate)}</span>
                  {endDate && (
                    <>
                      <span className="text-slate-300">-</span>
                      <span>{formatTime(endDate)}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                status.bgColor, status.color
              )}>
                {status.label}
              </span>
            </div>

            {/* Relative time */}
            <p className="text-xs text-slate-500 pl-11">
              {formatDistanceToNow(startDate, { addSuffix: true })}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Not scheduled</p>
            {onReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
                className="mt-2 h-7 text-xs"
              >
                Schedule Now
              </Button>
            )}
          </div>
        )}

        {/* Technician */}
        {(technicianName || onChangeTechnician) && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="text-sm text-slate-700">
                  {technicianName || "No technician assigned"}
                </span>
              </div>
              {onChangeTechnician && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onChangeTechnician}
                  className="h-6 text-[10px] text-slate-500 hover:text-slate-700"
                >
                  Change
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
