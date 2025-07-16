
import { useState } from 'react';
import { Calendar as CalendarIcon, Check, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PaymentMethod } from '@/types/payment';
import { teamMembers } from '@/data/team';

interface PaymentsFiltersProps {
  onFilterChange: (
    startDate: Date | undefined,
    endDate: Date | undefined,
    method: PaymentMethod | "all",
    technician: string | "all",
    client: string | "all"
  ) => void;
}

export function PaymentsFilters({ onFilterChange }: PaymentsFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [technician, setTechnician] = useState<string | "all">("all");
  const [client, setClient] = useState<string | "all">("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange(startDate, endDate, method, technician, client);
    setIsFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setMethod("all");
    setTechnician("all");
    setClient("all");
    onFilterChange(undefined, undefined, "all", "all", "all");
    setIsFiltersOpen(false);
  };

  // Sample list of clients (in a real app, this would come from an API)
  const clients = [
    { id: "c101", name: "John Anderson" },
    { id: "c102", name: "Sarah Williams" },
    { id: "c103", name: "Robert Johnson" },
    { id: "c104", name: "Jennifer Brown" },
    { id: "c105", name: "Michael Davis" },
    { id: "c106", name: "Lisa Wilson" },
    { id: "c107", name: "Daniel Martin" },
  ];

  // Filter for technicians only
  const technicians = teamMembers.filter(member => 
    member.role === "technician" || member.role === "manager"
  );

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[180px]">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Date Range</span>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left text-sm font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left text-sm font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Payment Method</span>
              <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod | "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="e-transfer">E-Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Technician</span>
              <Select value={technician} onValueChange={setTechnician}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Client</span>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
