import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestDashboard = () => {
  return (
    <PageLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">123</p>
              <p className="text-sm text-muted-foreground">Test metric</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">456</p>
              <p className="text-sm text-muted-foreground">Another metric</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Card 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">789</p>
              <p className="text-sm text-muted-foreground">Third metric</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Card 4</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1011</p>
              <p className="text-sm text-muted-foreground">Fourth metric</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Main Content Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p>If you can see this content, the layout is working correctly.</p>
              <p className="mt-2">The sidebar should be on the left, and this content should be in the main area.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default TestDashboard;
