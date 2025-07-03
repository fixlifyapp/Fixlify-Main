import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const ClientsFilters = () => {
  return (
    <>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background/50 border-muted-foreground/20 rounded-xl h-10">
          <SelectValue placeholder="Client Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="leads">Leads</SelectItem>
          <SelectItem value="prospect">Prospects</SelectItem>
        </SelectContent>
      </Select>
      
      <Select defaultValue="all-segments">
        <SelectTrigger className="w-full bg-background/50 border-muted-foreground/20 rounded-xl h-10">
          <SelectValue placeholder="Segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-segments">All Segments</SelectItem>
          <SelectItem value="residential">Residential</SelectItem>
          <SelectItem value="commercial">Commercial</SelectItem>
          <SelectItem value="industrial">Industrial</SelectItem>
        </SelectContent>
      </Select>
      
      <Select defaultValue="all-time">
        <SelectTrigger className="w-full bg-background/50 border-muted-foreground/20 rounded-xl h-10">
          <SelectValue placeholder="Last Interaction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};