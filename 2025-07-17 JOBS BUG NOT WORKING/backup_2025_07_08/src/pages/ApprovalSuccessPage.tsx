
import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, FileText } from "lucide-react";

const ApprovalSuccessPage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  
  const isApproved = action === 'approved';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardContent className="text-center p-8">
            {isApproved ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isApproved ? 'Approved!' : 'Response Recorded'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isApproved 
                ? 'Thank you for approving! We will contact you shortly to proceed with the next steps.'
                : 'Thank you for your response. We have recorded your feedback and will follow up accordingly.'
              }
            </p>

            {isApproved && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>What's next?</strong><br />
                  • You may receive a deposit request<br />
                  • We'll contact you to schedule the work<br />
                  • Check your messages for updates
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-2" />
              You can now close this page
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApprovalSuccessPage;
