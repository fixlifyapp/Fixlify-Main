
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, FileText } from "lucide-react";

interface Estimate {
  id: string;
  estimate_number: string;
  date: string;
  total: number;
  status: string;
  client_name?: string;
}

interface EstimatesTableProps {
  estimates: Estimate[];
}

export function EstimatesTable({ estimates }: EstimatesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return "bg-blue-100 text-blue-800";
      case 'accepted':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'draft':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estimates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No estimates found
              </TableCell>
            </TableRow>
          ) : (
            estimates.map((estimate) => (
              <TableRow key={estimate.id}>
                <TableCell className="font-medium">#{estimate.estimate_number}</TableCell>
                <TableCell>{estimate.client_name || "Unknown"}</TableCell>
                <TableCell>{new Date(estimate.date).toLocaleDateString()}</TableCell>
                <TableCell>{formatCurrency(estimate.total)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(estimate.status)}>
                    {estimate.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Convert
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
