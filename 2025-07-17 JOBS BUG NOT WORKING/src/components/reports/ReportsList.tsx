import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsTable } from "./ReportsTable";

export const ReportsList = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [filters, setFilters] = useState({
    reportType: 'standard',
    jobType: 'all',
    technician: 'all',
    serviceArea: 'all',
    adGroup: 'all',
    dateRange: 'month',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'created'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-run report when filters change
    runFilteredReport();
  }, [filters]);

  const runFilteredReport = async () => {
    setReportLoading(true);
    try {
      // Simulate API call with filtered data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate sample data based on filters
      const sampleData = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
        job_id: `JOB-${1000 + i}`,
        closed: Math.random() > 0.5 ? 'Yes' : 'No',
        total: `$${(Math.random() * 1000).toFixed(2)}`,
        cash: `$${(Math.random() * 200).toFixed(2)}`,
        credit: `$${(Math.random() * 800).toFixed(2)}`,
        billing: 'Standard',
        tech_share: `$${(Math.random() * 100).toFixed(2)}`,
        tip_amount: `$${(Math.random() * 50).toFixed(2)}`,
        parts: `$${(Math.random() * 300).toFixed(2)}`,
        company_parts: `$${(Math.random() * 200).toFixed(2)}`,
        tech_profit: `$${(Math.random() * 150).toFixed(2)}`,
        company_profit: `$${(Math.random() * 400).toFixed(2)}`
      }));
      
      setReportData(sampleData);
    } catch (error) {
      console.error('Error running filtered report:', error);
      toast.error("Failed to run report with filters.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    toast.success("Your report is being exported...");
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-fixlyfy-text-secondary">Generate and customize business reports</p>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-6">
        <ReportsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          onSearch={handleSearch}
        />
      </Card>

      {/* Report Results Table */}
      <ReportsTable
        data={reportData}
        loading={reportLoading}
        columns={[]}
      />
    </div>
  );
};
