
import { User, Mail } from "lucide-react";

interface ClientPortalHeaderProps {
  clientName: string;
}

export const ClientPortalHeader = ({ clientName }: ClientPortalHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Client Portal
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome back, {clientName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>Powered by</span>
            <span className="font-medium text-purple-600">Fixlify</span>
          </div>
        </div>
      </div>
    </div>
  );
};
