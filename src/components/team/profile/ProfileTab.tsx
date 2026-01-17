
import { useState, useEffect, useRef } from "react";
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
import { Plus, X, Upload, Phone, MapPin, Loader2, Check, Navigation, MapPinned } from "lucide-react";
import { useRBAC } from "@/components/auth/RBACProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Debounce hook for autosave
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface ProfileTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
  onUpdate?: () => void;
}

export const ProfileTab = ({ member, isEditing, onUpdate }: ProfileTabProps) => {
  // Controlled state for all editable fields
  const [formData, setFormData] = useState({
    name: member.name || '',
    email: member.email || '',
    address: member.address || '',
    internalNotes: member.internalNotes || '',
    laborCostPerHour: member.laborCostPerHour || 50,
    scheduleColor: member.scheduleColor || '#6366f1',
    isPublic: member.isPublic ?? true,
    availableForJobs: member.availableForJobs ?? true,
    twoFactorEnabled: member.twoFactorEnabled || false,
    callMaskingEnabled: member.callMaskingEnabled || false,
    // Home location for AI travel distance
    homeLatitude: member.homeLatitude || null,
    homeLongitude: member.homeLongitude || null,
    maxTravelDistanceKm: member.maxTravelDistanceKm || 50,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(member.phone || []);
  const [newPhone, setNewPhone] = useState("");
  const [skills, setSkills] = useState<TeamMemberSkill[]>(member.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(member.serviceAreas || []);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const { hasRole } = useRBAC();

  const isAdmin = hasRole('admin');

  // Debounced form data for autosave (500ms)
  const debouncedFormData = useDebounce(formData, 500);

  // Update local state when member prop changes
  useEffect(() => {
    setFormData({
      name: member.name || '',
      email: member.email || '',
      address: member.address || '',
      internalNotes: member.internalNotes || '',
      laborCostPerHour: member.laborCostPerHour || 50,
      scheduleColor: member.scheduleColor || '#6366f1',
      isPublic: member.isPublic ?? true,
      availableForJobs: member.availableForJobs ?? true,
      twoFactorEnabled: member.twoFactorEnabled || false,
      callMaskingEnabled: member.callMaskingEnabled || false,
      homeLatitude: member.homeLatitude || null,
      homeLongitude: member.homeLongitude || null,
      maxTravelDistanceKm: member.maxTravelDistanceKm || 50,
    });
    setPhoneNumbers(member.phone || []);
    setSkills(member.skills || []);
    setServiceAreas(member.serviceAreas || []);
    isInitialMount.current = true;
  }, [member]);

  // Autosave effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isEditing) return;

    saveProfile();
  }, [debouncedFormData]);

  const saveProfile = async () => {
    setSavingField('profile');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: debouncedFormData.name,
          phone: phoneNumbers[0] || null, // profiles table stores single phone
          internal_notes: debouncedFormData.internalNotes,
          labor_cost_per_hour: debouncedFormData.laborCostPerHour,
          schedule_color: debouncedFormData.scheduleColor,
          is_public: debouncedFormData.isPublic,
          available_for_jobs: debouncedFormData.availableForJobs,
          two_factor_enabled: debouncedFormData.twoFactorEnabled,
          call_masking_enabled: debouncedFormData.callMaskingEnabled,
          // Home location for AI travel distance
          home_latitude: debouncedFormData.homeLatitude,
          home_longitude: debouncedFormData.homeLongitude,
          max_travel_distance_km: debouncedFormData.maxTravelDistanceKm,
        })
        .eq('id', member.id);

      if (error) throw error;

      setSavingField(null);
      setSavedField('profile');
      setTimeout(() => setSavedField(null), 2000);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving profile:', error);
      setSavingField(null);
      toast.error('Failed to save profile');
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save indicator component
  const SaveIndicator = () => {
    if (savingField === 'profile') {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (savedField === 'profile') {
      return <Check className="h-4 w-4 text-emerald-500" />;
    }
    return null;
  };

  const handleAddPhone = () => {
    if (newPhone && !phoneNumbers.includes(newPhone) && isAdmin) {
      const updatedPhones = [...phoneNumbers, newPhone];
      setPhoneNumbers(updatedPhones);
      setNewPhone("");
      // Trigger save for phone update
      handleFieldChange('_trigger', Date.now());
    }
  };

  const handleRemovePhone = (phone: string) => {
    if (isAdmin) {
      const updatedPhones = phoneNumbers.filter(p => p !== phone);
      setPhoneNumbers(updatedPhones);
      // Trigger save for phone update
      handleFieldChange('_trigger', Date.now());
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

  // Geocode address to get coordinates for AI travel distance
  const handleGeocodeAddress = async () => {
    if (!formData.address) {
      toast.error('Please enter an address first');
      return;
    }

    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: {
          address: formData.address,
          country: 'USA' // Default to USA for US addresses
        }
      });

      if (error) throw error;

      // The geocode function returns { success, result: { latitude, longitude } }
      const result = data?.result;
      if (result?.latitude && result?.longitude) {
        setFormData(prev => ({
          ...prev,
          homeLatitude: result.latitude,
          homeLongitude: result.longitude,
        }));
        toast.success('Location set successfully');
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error('Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode address');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Clear home location coordinates
  const handleClearLocation = () => {
    setFormData(prev => ({
      ...prev,
      homeLatitude: null,
      homeLongitude: null,
    }));
  };

  // Only allow editing if user is admin and editing mode is active
  const canEdit = isAdmin && isEditing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Personal Info */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <SaveIndicator />
          </div>
          
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
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
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
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
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
            value={formData.internalNotes}
            onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
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
                  value={formData.laborCostPerHour}
                  onChange={(e) => handleFieldChange('laborCostPerHour', Number(e.target.value))}
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
                  style={{ backgroundColor: formData.scheduleColor }}
                ></div>
                <Input
                  id="color"
                  type="color"
                  value={formData.scheduleColor}
                  onChange={(e) => handleFieldChange('scheduleColor', e.target.value)}
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
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleFieldChange('isPublic', checked)}
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
                  checked={formData.availableForJobs}
                  onCheckedChange={(checked) => handleFieldChange('availableForJobs', checked)}
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
                  checked={formData.twoFactorEnabled}
                  onCheckedChange={(checked) => handleFieldChange('twoFactorEnabled', checked)}
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
                  checked={formData.callMaskingEnabled}
                  onCheckedChange={(checked) => handleFieldChange('callMaskingEnabled', checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Home Location for AI Travel Distance */}
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Home Base Location</h3>
            </div>
            {(formData.homeLatitude && formData.homeLongitude) && (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <MapPinned className="h-3 w-3 mr-1" />
                Set
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Set the technician's home or office location for AI-powered job recommendations based on travel distance.
          </p>

          <div className="space-y-4">
            {/* Use address to geocode */}
            <div>
              <Label>Set from Address</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Click "Set Location" to convert the address above to coordinates
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeocodeAddress}
                  disabled={!formData.address || isGeocoding || !isEditing}
                  className="flex-1"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    <>
                      <MapPinned className="h-4 w-4 mr-2" />
                      Set Location from Address
                    </>
                  )}
                </Button>
                {(formData.homeLatitude && formData.homeLongitude) && isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearLocation}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Show current coordinates if set */}
            {(formData.homeLatitude && formData.homeLongitude) ? (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="font-mono">{formData.homeLatitude?.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="font-mono">{formData.homeLongitude?.toFixed(6)}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  No location set. AI will use job history to estimate travel distance.
                </p>
              </div>
            )}

            {/* Max travel distance */}
            <div>
              <Label htmlFor="maxTravelDistance">Maximum Travel Distance</Label>
              <p className="text-xs text-muted-foreground mb-2">
                How far this technician is willing to travel for jobs
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="maxTravelDistance"
                  type="number"
                  value={formData.maxTravelDistanceKm}
                  onChange={(e) => handleFieldChange('maxTravelDistanceKm', Number(e.target.value))}
                  disabled={!isEditing}
                  className="w-24"
                  min={1}
                  max={500}
                />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
