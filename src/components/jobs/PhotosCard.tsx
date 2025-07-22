
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Image } from "lucide-react";

interface PhotosCardProps {
  jobId: string;
}

export const PhotosCard = ({ jobId }: PhotosCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photos
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Photos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No photos uploaded yet</p>
          <p className="text-sm">Take before/after photos to document your work</p>
        </div>
      </CardContent>
    </Card>
  );
};
