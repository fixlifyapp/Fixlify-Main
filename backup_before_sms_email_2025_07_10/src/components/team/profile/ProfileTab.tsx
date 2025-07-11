
import { useState } from "react";
import { TeamMemberProfile, TeamMemberSkill, ServiceArea } from "@/types/team-member";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleDropdown } from "@/components/team/RoleDropdown";
import { Plus, X, Upload, Phone, MapPin } from "lucide-react";
import { useRBAC } from "@/components/auth/RBACProvider";

interface ProfileTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const ProfileTab = ({ member, isEditing }: ProfileTabProps) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(member.phone || []);
  const [newPhone, setNewPhone] = useState("");
  const [skills, setSkills] = useState<TeamMemberSkill[]>(member.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(member.serviceAreas || []);
  const { hasRole } = useRBAC();
  
  const isAdmin = hasRole('admin');

  const handleAddPhone = () => {
    if (newPhone && !phoneNumbers.includes(newPhone) && isAdmin) {
      setPhoneNumbers([...phoneNumbers, newPhone]);
      setNewPhone("");
    }
  };

  const handleRemovePhone = (phone: string) => {
    if (isAdmin) {
      setPhoneNumbers(phoneNumbers.filter(p => p !== phone));
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase()) && isAdmin) {
      setSkills([...skills, { id: Date.now().toString(), name: newSkill }]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    if (isAdmin) {
      setSkills(skills.filter(s => s.id !== skillId));
    }
  };

  // Only allow editing if user is admin and editing mode is active
  const canEdit = isAdmin && isEditing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Personal Info */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            
            {isEditing && (
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  defaultValue={member.name}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  defaultValue={member.email}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="phone">Phone Numbers</Label>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPhone}
                      disabled={!newPhone}
                      className="h-8 px-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPhone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Add phone number"
                        className="flex-1"
                      />
                    </div>
                    
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          {phone}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePhone(phone)}
                            className="h-4 w-4 p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-2 mt-1">
                    {phoneNumbers.length > 0 ? (
                      phoneNumbers.map((phone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{phone}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No phone numbers added</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="address">Home Address</Label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                  <Textarea
                    id="address"
                    defaultValue={member.address || ""}
                    disabled={!isEditing}
                    className="flex-1"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Internal Notes */}
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Internal Notes</h3>
          <Textarea
            disabled={!isEditing}
            defaultValue={member.internalNotes || ""}
            placeholder="Add internal notes about this team member..."
            rows={5}
          />
        </Card>
      </div>
      
      {/* Right Column - Work Info */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Work Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <div className="mt-1">
                <RoleDropdown
                  userId={member.id}
                  role={member.role}
                  disabled={!isEditing}
                  testMode={true}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cost">Labor Cost Per Hour</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="cost"
                  type="number"
                  defaultValue={member.laborCostPerHour}
                  disabled={!isEditing}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="color">Schedule Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <div 
                  className="w-8 h-8 rounded-full border" 
                  style={{ backgroundColor: member.scheduleColor }}
                ></div>
                <Input
                  id="color"
                  type="color"
                  defaultValue={member.scheduleColor}
                  disabled={!isEditing}
                  className="w-16 h-8 p-0 border-none"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="skills">Job Types / Skills</Label>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSkill}
                    disabled={!newSkill}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <>
                  <Input
                    id="newSkill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill or job type"
                    className="mb-2"
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                        {skill.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="h-4 w-4 p-0 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-muted-foreground text-sm">No skills added</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills added</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="service-areas">Service Areas</Label>
              {isEditing ? (
                <Select defaultValue="sf">
                  <SelectTrigger id="service-areas" className="mt-1">
                    <SelectValue placeholder="Select service areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sf">San Francisco, CA</SelectItem>
                    <SelectItem value="oak">Oakland, CA</SelectItem>
                    <SelectItem value="sj">San Jose, CA</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {serviceAreas.length > 0 ? (
                    serviceAreas.map((area) => (
                      <Badge key={area.id} variant="outline">
                        <MapPin className="h-3 w-3 mr-1" /> {area.name}
                        {area.zipCode && ` (${area.zipCode})`}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No service areas defined</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="isPublic">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow clients to see this team member</p>
                </div>
                <Switch 
                  id="isPublic" 
                  checked={member.isPublic} 
                  disabled={!isEditing} 
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="availableForJobs">Available for Jobs</Label>
                  <p className="text-sm text-muted-foreground">Can be assigned to new jobs</p>
                </div>
                <Switch 
                  id="availableForJobs" 
                  checked={member.availableForJobs} 
                  disabled={!isEditing} 
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Extra security for account login</p>
                </div>
                <Switch 
                  id="twoFactor" 
                  checked={member.twoFactorEnabled} 
                  disabled={!isEditing} 
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="callMasking">Call Masking</Label>
                  <p className="text-sm text-muted-foreground">Hide personal number from clients</p>
                </div>
                <Switch 
                  id="callMasking" 
                  checked={member.callMaskingEnabled} 
                  disabled={!isEditing} 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
