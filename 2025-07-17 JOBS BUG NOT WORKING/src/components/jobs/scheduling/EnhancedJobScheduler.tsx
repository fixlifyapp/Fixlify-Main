
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  technician: string;
  available: boolean;
  conflictingJobs?: string[];
}

interface EnhancedJobSchedulerProps {
  jobId?: string;
  clientId?: string;
  onScheduled?: (scheduleData: any) => void;
}

export const EnhancedJobScheduler = ({ 
  jobId, 
  clientId, 
  onScheduled 
}: EnhancedJobSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("2");
  const [notes, setNotes] = useState<string>("");

  // Mock data - in real app this would come from your backend
  const technicians = [
    { id: "tech1", name: "John Doe", skills: ["Appliance Repair", "HVAC"], available: true },
    { id: "tech2", name: "Jane Smith", skills: ["Plumbing", "Electrical"], available: true },
    { id: "tech3", name: "Mike Johnson", skills: ["General Maintenance"], available: false }
  ];

  const timeSlots: TimeSlot[] = [
    { id: "slot1", startTime: "09:00", endTime: "11:00", technician: "John Doe", available: true },
    { id: "slot2", startTime: "11:00", endTime: "13:00", technician: "John Doe", available: true },
    { id: "slot3", startTime: "14:00", endTime: "16:00", technician: "John Doe", available: false, conflictingJobs: ["J-2005"] },
    { id: "slot4", startTime: "09:00", endTime: "11:00", technician: "Jane Smith", available: true },
    { id: "slot5", startTime: "13:00", endTime: "15:00", technician: "Jane Smith", available: true }
  ];

  const getAvailableSlots = () => {
    if (!selectedTechnician) return [];
    const tech = technicians.find(t => t.id === selectedTechnician);
    return timeSlots.filter(slot => slot.technician === tech?.name);
  };

  const handleSchedule = () => {
    const scheduleData = {
      jobId,
      clientId,
      date: selectedDate,
      technician: selectedTechnician,
      timeSlot: selectedTimeSlot,
      estimatedDuration: parseInt(estimatedDuration),
      notes
    };

    console.log("Scheduling job:", scheduleData);
    onScheduled?.(scheduleData);
  };

  const isValidSchedule = selectedDate && selectedTechnician && selectedTimeSlot;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Enhanced Job Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date">Schedule Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Technician Selection */}
        <div className="space-y-3">
          <Label>Select Technician</Label>
          <div className="grid gap-3">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTechnician === tech.id
                    ? 'border-blue-500 bg-blue-50'
                    : tech.available
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                }`}
                onClick={() => tech.available && setSelectedTechnician(tech.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Skills: {tech.skills.join(", ")}
                      </div>
                    </div>
                  </div>
                  <Badge variant={tech.available ? "default" : "destructive"}>
                    {tech.available ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        {selectedTechnician && (
          <div className="space-y-3">
            <Label>Available Time Slots</Label>
            <div className="grid gap-2">
              {getAvailableSlots().map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTimeSlot === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : slot.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => slot.available && setSelectedTimeSlot(slot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    {slot.available ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">
                          Conflict: {slot.conflictingJobs?.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (hours)</Label>
            <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours (Full day)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scheduling Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Scheduling Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions or requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Schedule Summary */}
        {isValidSchedule && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Schedule Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Date: {new Date(selectedDate).toLocaleDateString()}</div>
              <div>Technician: {technicians.find(t => t.id === selectedTechnician)?.name}</div>
              <div>Time: {getAvailableSlots().find(s => s.id === selectedTimeSlot)?.startTime} - {getAvailableSlots().find(s => s.id === selectedTimeSlot)?.endTime}</div>
              <div>Duration: {estimatedDuration} hour(s)</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSchedule}
            disabled={!isValidSchedule}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Job
          </Button>
          <Button variant="outline">
            Save as Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
