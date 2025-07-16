
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { fetchTeamMembers } from "@/data/team";
import { TeamMember } from "@/types/team";
import { toast } from "sonner";

interface TechnicianWithJobCount extends TeamMember {
  jobCount: number;
  specialties?: string[];
}

export const TechnicianSidebar = () => {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [technicians, setTechnicians] = useState<TechnicianWithJobCount[]>([]);
  const [filteredTechs, setFilteredTechs] = useState<TechnicianWithJobCount[]>([]);
  
  // Load technicians from Supabase
  useEffect(() => {
    const loadTechnicians = async () => {
      setIsLoading(true);
      try {
        const members = await fetchTeamMembers();
        
        // For now, add mock job counts and specialties
        const techsWithCounts = members.map((tech, index) => ({
          ...tech,
          jobCount: Math.floor(Math.random() * 20) + 1,
          specialties: [
            ["HVAC", "Plumbing", "Electrical", "Installation", "Maintenance", "Repair"][
              Math.floor(Math.random() * 6)
            ],
            ["Commercial", "Residential", "Emergency", "Scheduled", "Warranty"][
              Math.floor(Math.random() * 5)
            ]
          ]
        }));
        
        setTechnicians(techsWithCounts);
        setFilteredTechs(techsWithCounts);
        // Select all technicians by default
        setSelectedTechs(techsWithCounts.map(t => t.id));
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast.error("Failed to load technicians");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTechnicians();
  }, []);
  
  // Filter technicians based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTechs(technicians);
    } else {
      const lowercaseTerm = searchQuery.toLowerCase();
      const filtered = technicians.filter(tech => 
        tech.name.toLowerCase().includes(lowercaseTerm) || 
        tech.email.toLowerCase().includes(lowercaseTerm)
      );
      setFilteredTechs(filtered);
    }
  }, [searchQuery, technicians]);

  const handleTechSelect = (techId: string) => {
    setSelectedTechs(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTechs(filteredTechs.map(t => t.id));
    } else {
      setSelectedTechs([]);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixlyfy-card h-fit">
      <div className="p-4 border-b border-fixlyfy-border">
        <h3 className="font-medium">Technicians</h3>
      </div>
      
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted" size={16} />
          <Input
            className="pl-8"
            placeholder="Search technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-techs"
            checked={filteredTechs.length > 0 && selectedTechs.length === filteredTechs.length}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="all-techs"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All Technicians
          </label>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 size={24} className="animate-spin text-primary mr-2" />
            <span>Loading technicians...</span>
          </div>
        ) : (
          filteredTechs.map((tech) => (
            <div
              key={tech.id}
              className="p-4 border-b border-fixlyfy-border last:border-b-0 hover:bg-fixlyfy-bg-hover"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`tech-${tech.id}`}
                  checked={selectedTechs.includes(tech.id)}
                  onCheckedChange={() => handleTechSelect(tech.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={tech.avatar} />
                  <AvatarFallback>{getInitials(tech.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <label
                    htmlFor={`tech-${tech.id}`}
                    className="font-medium text-sm cursor-pointer"
                  >
                    {tech.name}
                  </label>
                  <p className="text-xs text-fixlyfy-text-secondary">
                    {tech.jobCount} job{tech.jobCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {tech.specialties && tech.specialties.length > 0 && (
                <div className="ml-8 mt-2 flex flex-wrap gap-1">
                  {tech.specialties.map((specialty, i) => (
                    <span key={i} className="text-xs bg-fixlyfy-bg-interface px-2 py-0.5 rounded-full text-fixlyfy-text-secondary">
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        
        {filteredTechs.length === 0 && !isLoading && (
          <div className="p-4 text-center text-fixlyfy-text-secondary">
            No technicians found
          </div>
        )}
      </div>
    </div>
  );
};
