
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, Share } from "lucide-react";

interface DocumentsTabProps {
  jobId: string;
}

export const DocumentsTab = ({ jobId }: DocumentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Upload contracts, photos, or other job-related files</p>
        </div>
      </CardContent>
    </Card>
  );
};
