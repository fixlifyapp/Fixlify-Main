import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Plus,
  Trash2,
  Edit,
  Play,
  Pause
} from "lucide-react";
import { toast } from "sonner";

export const ReportScheduler = () => {
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      name: 'Weekly Financial Summary',
      frequency: 'weekly',
      day: 'monday',
      time: '09:00',
      recipients: ['manager@company.com', 'owner@company.com'],
      isActive: true,
      lastRun: '2024-01-15',
      nextRun: '2024-01-22'
    },
    {
      id: '2',
      name: 'Monthly Performance Report',
      frequency: 'monthly',
      day: '1',
      time: '08:00',
      recipients: ['team@company.com'],
      isActive: true,
      lastRun: '2024-01-01',
      nextRun: '2024-02-01'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'weekly',
    day: 'monday',
    time: '09:00',
    recipients: '',
    reportType: 'financial'
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.recipients) {
      toast.error("Please fill in all required fields");
      return;
    }

    const schedule = {
      id: Date.now().toString(),
      name: newSchedule.name,
      frequency: newSchedule.frequency,
      day: newSchedule.day,
      time: newSchedule.time,
      recipients: newSchedule.recipients.split(',').map(email => email.trim()),
      isActive: true,
      lastRun: null,
      nextRun: getNextRunDate(newSchedule.frequency, newSchedule.day, newSchedule.time)
    };

    setSchedules([...schedules, schedule]);
    setNewSchedule({
      name: '',
      frequency: 'weekly',
      day: 'monday',
      time: '09:00',
      recipients: '',
      reportType: 'financial'
    });
    setIsCreating(false);
    toast.success("Report schedule created successfully!");
  };

  const getNextRunDate = (frequency: string, day: string, time: string) => {
    // Simplified calculation - in real app, use proper date library
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split('T')[0];
  };

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ));
    toast.success("Schedule updated successfully!");
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
    toast.success("Schedule deleted successfully!");
  };

  const runNow = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    toast.success(`Running "${schedule?.name}" now...`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Report Scheduler</h2>
          <p className="text-sm text-muted-foreground">
            Automate report delivery with custom schedules
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Create Schedule Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="e.g., Weekly Sales Report"
                />
              </div>
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={newSchedule.reportType} 
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, reportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial Summary</SelectItem>
                    <SelectItem value="performance">Performance Analytics</SelectItem>
                    <SelectItem value="jobs">Jobs Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newSchedule.frequency} 
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="day">Day</Label>
                <Select 
                  value={newSchedule.day} 
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, day: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newSchedule.frequency === 'weekly' ? (
                      <>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="1">1st</SelectItem>
                        <SelectItem value="15">15th</SelectItem>
                        <SelectItem value="last">Last day</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
              <Input
                id="recipients"
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                placeholder="manager@company.com, owner@company.com"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateSchedule}>Create Schedule</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Schedules */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>
                      {schedule.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="capitalize">{schedule.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{schedule.recipients.length} recipients</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {schedule.lastRun && (
                      <span>Last run: {schedule.lastRun} • </span>
                    )}
                    Next run: {schedule.nextRun}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runNow(schedule.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSchedule(schedule.id)}
                  >
                    {schedule.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automated report schedule
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
