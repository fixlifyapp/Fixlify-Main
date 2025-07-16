import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect } from "react";

const PreviewPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, this would fetch the actual invoice/estimate data from the server
  const previewData = {
    type: type || "invoice",
    number: id || "UNKNOWN",
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    companyInfo: {
      name: "Fixlify Services",
      logo: "/placeholder.svg",
      address: "456 Business Ave, Suite 789",
      phone: "(555) 987-6543",
              email: "info@fixlify.com",
      legalText: "All services are subject to our terms and conditions. Payment due within 30 days."
    },
    clientInfo: {
      name: "Michael Johnson",
      address: "123 Main St, Apt 45",
      phone: "(555) 123-4567",
      email: "michael.johnson@example.com"
    },
    items: [
      {
        description: "HVAC Service Call",
        quantity: 1,
        unitPrice: 125.00
      },
      {
        description: "Replacement Parts",
        quantity: 2,
        unitPrice: 75.50
      },
      {
        description: "Labor (2 hours)",
        quantity: 2,
        unitPrice: 100.00
      }
    ],
    notes: "Thank you for your business!"
  };

  const calculateTotal = () => {
    return previewData.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  useEffect(() => {
    document.title = `${previewData.type === "invoice" ? "Invoice" : "Estimate"} #${previewData.number}`;
  }, [previewData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="print:hidden mb-6 flex justify-between">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print</span>
          </Button>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border print:border-none print:shadow-none">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold">
                {previewData.type === "invoice" ? "INVOICE" : "ESTIMATE"}
              </h2>
              <p className="text-fixlyfy-text-secondary">#{previewData.number}</p>
            </div>
            <div className="text-right">
              <img 
                src={previewData.companyInfo.logo} 
                alt={previewData.companyInfo.name} 
                className="h-16 mb-2 ml-auto"
              />
              <h3 className="font-bold text-lg">{previewData.companyInfo.name}</h3>
              <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
                {previewData.companyInfo.address}<br />
                {previewData.companyInfo.phone}<br />
                {previewData.companyInfo.email}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-2 text-fixlyfy-text-secondary">Bill To:</h4>
              <p className="font-medium">{previewData.clientInfo.name}</p>
              <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
                {previewData.clientInfo.address}<br />
                {previewData.clientInfo.phone}<br />
                {previewData.clientInfo.email}
              </p>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-fixlyfy-text-secondary">Date:</span>
                  <span>{previewData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-fixlyfy-text-secondary">Due Date:</span>
                  <span>{previewData.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-fixlyfy-text-secondary">
                    {previewData.type === "invoice" ? "Invoice" : "Estimate"} #:
                  </span>
                  <span>{previewData.number}</span>
                </div>
              </div>
            </div>
          </div>
          
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-fixlyfy-border">
                <th className="py-3 text-left">Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Unit Price</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {previewData.items.map((item, index) => (
                <tr key={index} className="border-b border-fixlyfy-border">
                  <td className="py-4">{item.description}</td>
                  <td className="py-4 text-right">{item.quantity}</td>
                  <td className="py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
              
              <tr>
                <td colSpan={3} className="py-4 text-right font-semibold">Total:</td>
                <td className="py-4 text-right font-bold">${calculateTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="mb-8">
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-fixlyfy-text-secondary">{previewData.notes}</p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-fixlyfy-border text-sm text-fixlyfy-text-secondary">
            <p>{previewData.companyInfo.legalText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
