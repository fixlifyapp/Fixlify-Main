
import { PageLayout } from "@/components/layout/PageLayout";

export const LoadingState = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 w-56 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </PageLayout>
  );
};
