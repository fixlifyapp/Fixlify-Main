
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type EstimateRow = Database['public']['Tables']['estimates']['Row'];

interface EstimatesListProps {
  estimates: EstimateRow[];
  onEditEstimate: (estimate: EstimateRow) => void;
  onViewEstimate: (estimate: EstimateRow) => void;
}

const EstimatesList: React.FC<EstimatesListProps> = ({
  estimates,
  onEditEstimate,
  onViewEstimate
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No estimates found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimates.map((estimate) => (
        <div key={estimate.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold">{estimate.estimate_number}</h3>
              {estimate.title && (
                <p className="text-gray-600">{estimate.title}</p>
              )}
              <p className="text-sm text-gray-500">
                Created: {new Date(estimate.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold">${estimate.total.toFixed(2)}</p>
                <p className="text-sm capitalize text-gray-600">{estimate.status}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onViewEstimate(estimate)}>
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditEstimate(estimate)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyToClipboard(estimate.estimate_number)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Number
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EstimatesList;
