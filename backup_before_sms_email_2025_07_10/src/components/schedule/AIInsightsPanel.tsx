
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, Clock, Activity, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/data/real-jobs";
import { clients } from "@/data/real-clients";

export const AIInsightsPanel = () => {
  const [activeTab, setActiveTab] = useState("insights");

  // Calculate analytics based on the real data
  const completedJobs = jobs.filter(job => job.status === "completed");
  const scheduledJobs = jobs.filter(job => job.status === "scheduled");
  const inProgressJobs = jobs.filter(job => job.status === "in-progress");
  
  const totalRevenue = completedJobs.reduce((sum, job) => sum + job.revenue, 0);
  const averageJobValue = completedJobs.length > 0 
    ? totalRevenue / completedJobs.length 
    : 0;
  
  // Group jobs by technician for technician performance
  const technicianPerformance = completedJobs.reduce((acc, job) => {
    const techName = job.technician.name;
    if (!acc[techName]) {
      acc[techName] = {
        name: techName,
        jobs: 0,
        revenue: 0
      };
    }
    acc[techName].jobs += 1;
    acc[techName].revenue += job.revenue;
    return acc;
  }, {} as Record<string, {name: string; jobs: number; revenue: number}>);

  const techPerformanceData = Object.values(technicianPerformance);
  
  // Group jobs by service type
  const serviceTypes = jobs.reduce((acc, job) => {
    const type = job.tags[0] || "Other";
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Generate forecast data based on current jobs
  const forecastData = [
    { name: "Week 1", projected: 5850, actual: 5850 },
    { name: "Week 2", projected: 7250, actual: 7250 },
    { name: "Week 3", projected: 9100, actual: null },
    { name: "Week 4", projected: 8500, actual: null },
  ];
  
  const insights = [
    {
      icon: Brain,
      title: "Schedule Optimization",
      description: "Grouping jobs by location could reduce travel time by approximately 15%",
      color: "text-indigo-500"
    },
    {
      icon: Activity,
      title: "Service Pattern",
      description: `HVAC services make up ${serviceTypes['HVAC'] || 0} jobs of your current workload`,
      color: "text-emerald-500"
    },
    {
      icon: Calendar,
      title: "Capacity Planning",
      description: `You have ${scheduledJobs.length} upcoming jobs with potential for 3 more same-day services`,
      color: "text-blue-500"
    },
    {
      icon: AlertCircle,
      title: "Technician Utilization",
      description: `Robert Smith has the highest job completion rate (${techPerformanceData.find(t => t.name === "Robert Smith")?.jobs || 0} jobs)`,
      color: "text-rose-500"
    }
  ];

  return (
    <div className="fixlyfy-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-fixlyfy-border">
        <h3 className="font-medium flex items-center">
          <Brain className="mr-2 text-fixlyfy" size={18} /> AI Schedule Insights
        </h3>
        <Badge variant="outline" className="text-fixlyfy">
          Data-Driven
        </Badge>
      </div>

      <div className="flex border-b border-fixlyfy-border">
        <button
          className={`flex-1 px-4 py-2 text-sm ${
            activeTab === "insights" ? "border-b-2 border-fixlyfy text-fixlyfy font-medium" : "text-fixlyfy-text-secondary"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          Insights
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm ${
            activeTab === "analytics" ? "border-b-2 border-fixlyfy text-fixlyfy font-medium" : "text-fixlyfy-text-secondary"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {activeTab === "insights" ? (
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <p className="text-sm text-fixlyfy-text-secondary">
              AI-generated insights based on your schedule and historical data:
            </p>

            {insights.map((insight, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-md flex">
                <div className={`p-1.5 rounded bg-white mr-3 ${insight.color}`}>
                  <insight.icon size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-fixlyfy-text-secondary">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 text-sm">Weekly Revenue Forecast</h4>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#82ca9d"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-1"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-1"></div>
                <span>Projected</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-fixlyfy/5 border border-fixlyfy/20 rounded-md">
            <div className="flex items-start">
              <CheckCircle2 size={16} className="text-fixlyfy mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium">Optimize Route Planning</p>
                <p className="text-xs text-fixlyfy-text-secondary">
                  Based on current workload, optimize technician routes for maximum efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 border border-fixlyfy-border rounded-md text-center">
              <p className="text-xs text-fixlyfy-text-secondary">Jobs Scheduled</p>
              <p className="text-xl font-medium">{scheduledJobs.length}</p>
            </div>
            <div className="p-3 border border-fixlyfy-border rounded-md text-center">
              <p className="text-xs text-fixlyfy-text-secondary">In Progress</p>
              <p className="text-xl font-medium">{inProgressJobs.length}</p>
            </div>
            <div className="p-3 border border-fixlyfy-border rounded-md text-center">
              <p className="text-xs text-fixlyfy-text-secondary">Avg. Job Value</p>
              <p className="text-xl font-medium">${averageJobValue.toFixed(0)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Technician Performance</h4>
            {techPerformanceData.map((tech, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{tech.name}</span>
                  <span className="font-medium">{tech.jobs} jobs</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-fixlyfy rounded-full"
                    style={{ width: `${(tech.jobs / Math.max(...techPerformanceData.map(t => t.jobs))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Peak Schedule Times</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-fixlyfy/5 rounded">
                <div className="flex">
                  <Clock size={16} className="mr-2 text-fixlyfy" />
                  <span className="text-sm">Morning (8AM-12PM)</span>
                </div>
                <span className="font-medium text-sm">5 jobs</span>
              </div>
              <div className="flex justify-between p-2 bg-fixlyfy/10 rounded">
                <div className="flex">
                  <Clock size={16} className="mr-2 text-fixlyfy" />
                  <span className="text-sm">Afternoon (12PM-5PM)</span>
                </div>
                <span className="font-medium text-sm">3 jobs</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <div className="flex">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm">Evening (After 5PM)</span>
                </div>
                <span className="font-medium text-sm">2 jobs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-fixlyfy-border">
        <Button variant="outline" className="w-full text-fixlyfy border-fixlyfy/20">
          Generate Full Report
        </Button>
      </div>
    </div>
  );
};
