
import { Card } from "@/components/ui/card";

interface ReportsTableProps {
  data: any[];
  loading: boolean;
  columns: string[];
}

export const ReportsTable = ({ data, loading, columns }: ReportsTableProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const tableColumns = columns.length > 0 ? columns : [
    'Job Id', 'Closed', 'Total', 'Cash', 'Credit', 'Billing', 
    'Tech Share', 'Tip Amount', 'Parts', 'Company Parts', 
    'Tech Profit', 'Company Profit'
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index} className="text-left p-3 font-medium text-gray-600 text-sm">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-12 text-gray-500">
                  No Records Found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {tableColumns.map((column, colIndex) => (
                    <td key={colIndex} className="p-3 text-sm">
                      {row[column.toLowerCase().replace(' ', '_')] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {data.length > 0 && (
        <div className="p-3 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            Totals: {data.length}
          </div>
        </div>
      )}
    </Card>
  );
};
