import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface InvoiceStatusData {
  name: string;
  value: number;
  color: string;
}

interface InvoiceStatusBreakdownProps {
  isRefreshing?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`}</p>
      </div>
    );
  }
  return null;
};

export const InvoiceStatusBreakdown = ({ isRefreshing = false }: InvoiceStatusBreakdownProps) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setIsLoading(true);
      
      try {
        // Since invoices table has been removed, use placeholder data
        setTimeout(() => {
          // Sample data for demonstration purposes
          const placeholderData: InvoiceStatusData[] = [
            { name: 'Paid', value: 15000, color: '#10B981' },
            { name: 'Pending', value: 8500, color: '#3B82F6' },
            { name: 'Overdue', value: 3200, color: '#EF4444' },
            { name: 'Partial', value: 1800, color: '#F59E0B' },
          ];
          
          const totalAmount = placeholderData.reduce((sum, item) => sum + item.value, 0);
          
          setInvoiceData(placeholderData);
          setTotal(totalAmount);
          setIsLoading(false);
        }, 800); // Simulate loading delay
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        
        // Fallback data if there's an error
        const fallbackData: InvoiceStatusData[] = [
          { name: 'No Data', value: 100, color: '#E5E7EB' }
        ];
        
        setInvoiceData(fallbackData);
        setTotal(0);
        setIsLoading(false);
        
        toast.error('Unable to load invoice data', {
          description: 'Invoice functionality is being rebuilt'
        });
      }
    };
    
    fetchInvoiceData();
  }, [isRefreshing]);

  const handleRemindersClick = () => {
    toast.info('Invoice functionality is being rebuilt');
    navigate('/jobs');
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Invoice Status</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
          Go to Jobs
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
          </div>
        ) : (
          <>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {invoiceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-fixlyfy-text-secondary">Total Invoice Amount</p>
              <p className="text-2xl font-bold">${total.toLocaleString()}</p>
              <p className="text-xs italic mt-1 text-fixlyfy-text-secondary">Sample data - Invoice functionality is being rebuilt</p>
              <Button variant="outline" className="mt-4 w-full" onClick={handleRemindersClick}>
                <Send size={16} className="mr-2" />
                Go to Jobs
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
