
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Edit, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ClientInfo {
  fullName: string;
  address: string;
  phone: string;
  email: string;
}

interface ClientInformationSectionProps {
  clientInfo: ClientInfo;
  onClientInfoUpdate: (clientInfo: ClientInfo) => void;
  clientId?: string;
}

export const ClientInformationSection = ({ 
  clientInfo, 
  onClientInfoUpdate, 
  clientId 
}: ClientInformationSectionProps) => {
  const navigate = useNavigate();
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [tempClientInfo, setTempClientInfo] = useState(clientInfo);

  const handleSaveClientInfo = () => {
    onClientInfoUpdate(tempClientInfo);
    setEditingClientInfo(false);
    toast.success("Client information updated");
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Client Information</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (editingClientInfo) {
                handleSaveClientInfo();
              } else {
                setTempClientInfo(clientInfo);
                setEditingClientInfo(true);
              }
            }}
          >
            {editingClientInfo ? <CheckCircle size={16} /> : <Edit size={16} />}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              {editingClientInfo ? (
                <Input 
                  value={tempClientInfo.fullName}
                  onChange={(e) => setTempClientInfo({ ...tempClientInfo, fullName: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium">{clientInfo.fullName}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              {editingClientInfo ? (
                <Input 
                  value={tempClientInfo.address}
                  onChange={(e) => setTempClientInfo({ ...tempClientInfo, address: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-muted-foreground" />
                  <p>{clientInfo.address}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Methods */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              {editingClientInfo ? (
                <div className="space-y-2 mt-1">
                  <Input 
                    value={tempClientInfo.phone}
                    onChange={(e) => setTempClientInfo({ ...tempClientInfo, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <Input 
                    value={tempClientInfo.email}
                    onChange={(e) => setTempClientInfo({ ...tempClientInfo, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Phone size={16} className="text-fixlyfy" />
                    <p>{clientInfo.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={16} className="text-fixlyfy" />
                    <p>{clientInfo.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            {!editingClientInfo && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full md:w-auto"
                onClick={() => {
                  if (clientId) {
                    navigate(`/clients/${clientId}`);
                  }
                }}
              >
                View Client Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
